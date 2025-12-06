
import { computeIntersectionOfThreeSpheres, generateHotZoneSceneObjects } from './HotZoneCloudPointsGenerator.js';

console.log("DEBUG: Test Harness Start");

const mockSettings = {
    centerPole: {
        micStickRadius: 50,
        yDistanceFromArmPoles: 100,
        height: 200
    },
    armPoles: {
        xDistance: 200,
        height: 200
    },
    arms: {
        leftArmMinLength: 100,
        leftArmMaxLength: 300,
        rightArmMinLength: 100,
        rightArmMaxLength: 300
    }
};

try {
    const objects = generateHotZoneSceneObjects(mockSettings, 10);
    console.log(`DEBUG: Total Objects: ${objects.length}`);

    if (objects.length > 0) {
        console.log("DEBUG: First Object:", JSON.stringify(objects[0]));

        const lines = objects.filter(o => o.type === 'line');
        console.log(`DEBUG: Total Lines: ${lines.length}`);
        if (lines.length > 0) {
            console.log("DEBUG: First Line:", JSON.stringify(lines[0]));
        }

        const points = objects.filter(o => o.type === 'point');
        console.log(`DEBUG: Total Points: ${points.length}`);
        if (points.length > 0) {
            console.log("DEBUG: First Point:", JSON.stringify(points[0]));
        }
    } else {
        console.warn("DEBUG: No objects generated!");
    }

} catch (e) {
    console.error("DEBUG: Error running generator:", e);
}
