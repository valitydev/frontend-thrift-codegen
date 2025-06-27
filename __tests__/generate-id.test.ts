import { generateId } from '../tools/static/utils/generate-id';

describe('generateId function', () => {
    it('should return a string', () => {
        const id = generateId();
        expect(typeof id).toBe('string');
    });

    it('should return a unique ID each time it is called', () => {
        const id1 = generateId();
        const id2 = generateId();
        expect(id1).not.toBe(id2);
    });

    it('should return a base64 encoded string', () => {
        const id = generateId();
        const isBase64 = /^[A-Za-z0-9+/]+[=]{0,2}$/.test(id);
        expect(isBase64).toBe(true);
    });

    it('should have a consistent length', () => {
        const id1 = generateId();
        const id2 = generateId();
        expect(id1.length).toBe(id2.length);
    });
});
