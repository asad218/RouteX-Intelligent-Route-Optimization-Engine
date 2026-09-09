class MinHeap {
    constructor(compare) {
        this.heap = [];
        this.compare = compare;
    }

    getParentIndex(i) {
        return Math.floor((i - 1) / 2);
    }

    getLeftChildIndex(i) {
        return 2 * i + 1;
    }

    getRightChildIndex(i) {
        return 2 * i + 2;
    }

    insert(value) {
        this.heap.push(value);

        let currentIndex = this.heap.length - 1;

        while (currentIndex > 0) {
            const parentIndex = this.getParentIndex(currentIndex);

            if (this.compare(this.heap[parentIndex], this.heap[currentIndex]) <= 0) {
                break;
            }

            [this.heap[parentIndex], this.heap[currentIndex]] =
                [this.heap[currentIndex], this.heap[parentIndex]];

            currentIndex = parentIndex;
        }
    }

    extractMin() {
        if (this.heap.length === 0) {
            return null;
        }

        if (this.heap.length === 1) {
            return this.heap.pop();
        }

        const min = this.heap[0];
        this.heap[0] = this.heap.pop();

        let currentIndex = 0;

        while (true) {
            const leftChildIndex = this.getLeftChildIndex(currentIndex);
            const rightChildIndex = this.getRightChildIndex(currentIndex);
            let smallestIndex = currentIndex;

            if (
                leftChildIndex < this.heap.length &&
                this.compare(this.heap[leftChildIndex], this.heap[smallestIndex]) < 0
            ) {
                smallestIndex = leftChildIndex;
            }

            if (
                rightChildIndex < this.heap.length &&
                this.compare(this.heap[rightChildIndex], this.heap[smallestIndex]) < 0
            ) {
                smallestIndex = rightChildIndex;
            }

            if (smallestIndex === currentIndex) {
                break;
            }

            [this.heap[currentIndex], this.heap[smallestIndex]] =
                [this.heap[smallestIndex], this.heap[currentIndex]];

            currentIndex = smallestIndex;
        }

        return min;
    }
}

module.exports = MinHeap;