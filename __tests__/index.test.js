// Simple test to verify Jest is working
describe('Basic Test', () => {
  test('should work', () => {
    expect(1 + 1).toBe(2);
  });

  test('should handle strings', () => {
    expect('hello' + ' world').toBe('hello world');
  });

  test('should handle arrays', () => {
    const arr = [1, 2, 3];
    expect(arr).toHaveLength(3);
    expect(arr).toContain(2);
  });
});
