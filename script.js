var Example = Example || {};

Example.basic = function() {
    var Engine = Matter.Engine,
        Render = Matter.Render,
        Runner = Matter.Runner,
        Events = Matter.Events,
        Composites = Matter.Composites,
        Common = Matter.Common,
        MouseConstraint = Matter.MouseConstraint,
        Mouse = Matter.Mouse,
        World = Matter.World,
        Bodies = Matter.Bodies,
        Body = Matter.Body;

    var engine = Engine.create(),
        world = engine.world;

    var render = Render.create({
        element: document.body,
        engine: engine,
        options: {
            width: Math.min(document.documentElement.clientWidth, 800),
            height: Math.min(document.documentElement.clientHeight, 600),
            showAngleIndicator: false,
            showSleeping: true,
            wireframes : false
        }
    });

    Render.run(render);

    var runner = Runner.create();
    Runner.run(runner, engine);

    World.add(world, [
        Bodies.rectangle(400, 0, 800, 50, { isStatic: true }),
        Bodies.rectangle(400, 600, 800, 50, { isStatic: true }),
        Bodies.rectangle(800, 300, 50, 600, { isStatic: true }),
        Bodies.rectangle(0, 300, 50, 600, { isStatic: true })

    ]);

    var mouse = Mouse.create(render.canvas),
        mouseConstraint = MouseConstraint.create(engine, {
            mouse: mouse,
            constraint: {
                stiffness: 0.2,
                render: {
                    visible: false
                }
            }
        });

    World.add(world, mouseConstraint);
    render.mouse = mouse;

    Render.lookAt(render, {
        min: { x: 0, y: 0 },
        max: { x: 800, y: 600 }
    });
    engine.enableSleeping = true;
    engine.constraintIterations = 3;

    var now = Date.now();
    var max_balls = 2000;
    var d = Immutable
        .fromJS(big_data)
        .map((x) => {
            return x.update("timestamp", (date) => (new Date(date)).getTime());
        });
    var last_timestamp = d.last().get("timestamp");
    var data = d.map((x) => {
        return x.update("timestamp", (ts) => now + 37000 - (last_timestamp - ts));
    });
    var fast_forward_duration = 1000;
    var fast_forward_tick = 200;
    var color = d3.scaleOrdinal(d3.schemeCategory20b);
    var my_now_ix = data.findIndex((x) => x.get("timestamp") >= (now - fast_forward_duration));
    var my_now = data.get(Math.max(0, my_now_ix - max_balls)).get("timestamp");
    var ff_speed = (now - my_now) / (fast_forward_duration / fast_forward_tick);
    var fast_forward = true;
    var n = 0;

    var tick = function() {
        if(!data
           .filter((d) => d.has("body"))
           .every((d) => d.get("body").isStatic)) {
            setTimeout(tick, 100);
            return;
        }
        if(fast_forward) {
            my_now += ff_speed;
            actual_now = Date.now();
            if(my_now > actual_now) {
                fast_forward = false;
                setTimeout(tick, 1000);
                console.log("End of fast forward");
                return;
            }
        } else {
            my_now = Date.now();
        }

        document.getElementById("label").innerHTML = new Date(my_now);
        var keyed = data
            .toKeyedSeq();
        var select = keyed
            .filter((x) => x.get("timestamp") <= my_now)
            .takeLast(max_balls);
        data = select
            .filter((x) => !x.has("body"))
            .take(100)
            .reduce((a, v, k) => {
                var b = Bodies.circle(50 + Math.random() * 700,
                                      30 + Math.random() * 50,
                                      3,
                                      {//restitution: 0.8,
                                          sleepThreshold: 10,
                                          //slop:0,
                                          render: {fillStyle: color(v.get("branch"))}});
                Events.on(b, "sleepStart", (x) =>  {Matter.Body.setStatic(x.source, true);});
                Events.on(b, "sleepEnd", (x) =>  {Matter.Body.setStatic(x.source, false);});
                if(!fast_forward)
                    console.log("Adding " + k);
                World.add(world, b);
                return a.setIn([k, "body"], b);
            }, data);
        // data = data.toKeyedSeq()
        //     .filter((x, i) => (!select.has(i) && x.has("body")))
        //     .reduce((a, v, k) => {
        //         World.remove(world, v.get("body"));
        //         return a.deleteIn([k, "body"]);
        //     }, data);
        setTimeout(tick, fast_forward ? fast_forward_tick : 1000);
    };
    tick();


    return {
        engine: engine,
        runner: runner,
        render: render,
        canvas: render.canvas,
        stop: function() {
            Matter.Render.stop(render);
            Matter.Runner.stop(runner);
        }
    };
};

Example.basic();
