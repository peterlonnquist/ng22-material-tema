import { createFakeHttpResource } from './fake-http-resource';

describe('createFakeHttpResource', () => {
  it('börjar i idle med startvärdet', () => {
    const fakeHttpResource = createFakeHttpResource<string[]>([]);

    expect(fakeHttpResource.status()).toBe('idle');
    expect(fakeHttpResource.value()).toEqual([]);
    expect(fakeHttpResource.isLoading()).toBe(false);
  });

  it('har value() undefined utan startvärde, som httpResource utan defaultValue', () => {
    const fakeHttpResource = createFakeHttpResource<{ id: number }>();

    expect(fakeHttpResource.value()).toBeUndefined();
    expect(fakeHttpResource.hasValue()).toBe(false);

    fakeHttpResource.resolve({ id: 1 });
    expect(fakeHttpResource.value()).toEqual({ id: 1 });
    expect(fakeHttpResource.hasValue()).toBe(true);
  });

  it('hämtar och svarar', () => {
    const fakeHttpResource = createFakeHttpResource<string[]>([]);

    fakeHttpResource.loading();
    expect(fakeHttpResource.isLoading()).toBe(true);

    fakeHttpResource.resolve(['a']);
    expect(fakeHttpResource.isLoading()).toBe(false);
    expect(fakeHttpResource.value()).toEqual(['a']);
  });

  it('har fel och kastar från value() i felläge, som en riktig resurs', () => {
    const fakeHttpResource = createFakeHttpResource<string[]>([]);
    const error = new Error('500');

    fakeHttpResource.fail(error);

    expect(fakeHttpResource.error()).toBe(error);
    expect(fakeHttpResource.hasValue()).toBe(false);
    expect(() => fakeHttpResource.value()).toThrow();
  });

  it('ändrar värdet lokalt med set() och update(), som en riktig resurs', () => {
    const fakeHttpResource = createFakeHttpResource<string[]>([]);
    fakeHttpResource.resolve(['b']);

    fakeHttpResource.update((lista) => ['a', ...lista]);

    expect(fakeHttpResource.status()).toBe('local');
    expect(fakeHttpResource.value()).toEqual(['a', 'b']);

    fakeHttpResource.set([]);
    expect(fakeHttpResource.value()).toEqual([]);
  });
});
