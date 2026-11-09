import { fakeHttpResource } from './fake-http-resource';

describe('fakeHttpResource', () => {
  it('börjar i idle med startvärdet', () => {
    const resource = fakeHttpResource<string[]>([]);

    expect(resource.status()).toBe('idle');
    expect(resource.value()).toEqual([]);
    expect(resource.isLoading()).toBe(false);
  });

  it('hämtar och svarar', () => {
    const resource = fakeHttpResource<string[]>([]);

    resource.loading();
    expect(resource.isLoading()).toBe(true);

    resource.resolve(['a']);
    expect(resource.isLoading()).toBe(false);
    expect(resource.value()).toEqual(['a']);
  });

  it('har fel och kastar från value() i felläge, som en riktig resurs', () => {
    const resource = fakeHttpResource<string[]>([]);
    const error = new Error('500');

    resource.fail(error);

    expect(resource.error()).toBe(error);
    expect(resource.hasValue()).toBe(false);
    expect(() => resource.value()).toThrow();
  });
});
