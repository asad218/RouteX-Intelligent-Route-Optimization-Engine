const { haversine } = require('../src/services/utils');

describe('Haversine Distance Calculator', () => {
    test('should return 0 meters for identical coordinates', () => {
        const dist = haversine(28.6129, 77.2295, 28.6129, 77.2295);
        expect(Math.round(dist)).toBe(0);
    });

    test('should calculate accurate distance between India Gate and Jamia Millia Islamia', () => {
        // India Gate: 28.6129° N, 77.2295° E
        // Jamia Millia Islamia: 28.5616° N, 77.2802° E
        // Straight line distance is approx ~7.4 km (7400m)
        const dist = haversine(28.6129, 77.2295, 28.5616, 77.2802);
        expect(dist).toBeGreaterThan(7000);
        expect(dist).toBeLessThan(8000);
    });

    test('should be symmetric regardless of coordinate order', () => {
        const distA = haversine(28.6129, 77.2295, 28.5134, 77.2514);
        const distB = haversine(28.5134, 77.2514, 28.6129, 77.2295);
        expect(distA).toBeCloseTo(distB, 5);
    });
});
