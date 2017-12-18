var Example = Example || {};

Example.basic = function() {
    var Engine = Matter.Engine,
        Render = Matter.Render,
        Runner = Matter.Runner,
        Composites = Matter.Composites,
        Common = Matter.Common,
        MouseConstraint = Matter.MouseConstraint,
        Mouse = Matter.Mouse,
        World = Matter.World,
        Bodies = Matter.Bodies;

    var engine = Engine.create(),
        world = engine.world;

    var render = Render.create({
        element: document.body,
        engine: engine,
        options: {
            width: Math.min(document.documentElement.clientWidth, 800),
            height: Math.min(document.documentElement.clientHeight, 600),
            showAngleIndicator: false,
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

    var now = Date.now();
    var data = Immutable.Range(0, 10).map(function(i) {
        return Immutable.Map({"timestamp" : now - 6000 + (i * 2000)});
    }).toList();

    var tick = function() {
        var now = Date.now();
        data = data.map(function(d) {
            if(d.get("timestamp") <= now && !(d.has("body"))) {
                var b = Bodies.circle(380 + Math.random() * 40, 50, 25, {restitution: 0.8});
                World.add(world, b);
                return d.set("body", b);
            }
            return d;
        });
    };
    tick();
    setInterval(tick, 1000);


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
