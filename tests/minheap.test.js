const MinHeap = require('../src/services/routing/Minheap');

describe('MinHeap Priority Queue', () => {
    test('should extract minimum element correctly', () => {
        const heap = new MinHeap((a, b) => a.val - b.val);
        heap.insert({ name: 'C', val: 30 });
        heap.insert({ name: 'A', val: 10 });
        heap.insert({ name: 'B', val: 20 });

        expect(heap.extractMin()).toEqual({ name: 'A', val: 10 });
        expect(heap.extractMin()).toEqual({ name: 'B', val: 20 });
        expect(heap.extractMin()).toEqual({ name: 'C', val: 30 });
    });

    test('should handle empty heap extract gracefully', () => {
        const heap = new MinHeap((a, b) => a - b);
        expect(heap.extractMin()).toBeNull();
    });

    test('should maintain heap ordering with multiple insertions', () => {
        const heap = new MinHeap((a, b) => a.distance - b.distance);
        const items = [50, 10, 40, 5, 25, 100];
        items.forEach(d => heap.insert({ distance: d }));

        const extracted = [];
        while (heap.heap.length > 0) {
            extracted.push(heap.extractMin().distance);
        }

        expect(extracted).toEqual([5, 10, 25, 40, 50, 100]);
    });
});
