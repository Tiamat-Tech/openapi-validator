const { propertyCaseCollision } = require('../src/rules');
const { makeCopy, rootDocument, testRule, severityCodes } = require('./utils');

const name = 'property-case-collision';

describe('Spectral rule: property-case-collision', () => {
  it('should not error with a clean spec', async () => {
    const results = await testRule(name, propertyCaseCollision, rootDocument);

    expect(results).toHaveLength(0);
  });

  it('should not error if invalid properties are deprecated', async () => {
    const testDocument = makeCopy(rootDocument);

    testDocument.components.schemas.Movie.properties.IMDBRating = {
      type: 'string',
      deprecated: true
    };
    testDocument.components.schemas.Movie.properties.IDMB_rating = {
      type: 'string'
    };

    const results = await testRule(name, propertyCaseCollision, testDocument);

    expect(results).toHaveLength(0);
  });

  it('should return an error when two property names of different case conventions are identical if converted to a single case', async () => {
    const testDocument = makeCopy(rootDocument);

    testDocument.components.schemas.Movie.properties.IMDBRating = {
      type: 'string'
    };
    testDocument.components.schemas.Movie.properties.IMDB_rating = {
      type: 'string'
    };

    const results = await testRule(name, propertyCaseCollision, testDocument);

    expect(results).toHaveLength(5);

    const validation = results[0];
    expect(validation.code).toBe(name);
    expect(validation.message).toBe(
      'Avoid duplicate property names within a schema, even if different case conventions are used'
    );
    expect(validation.path).toStrictEqual([
      'paths',
      '/v1/movies',
      'post',
      'requestBody',
      'content',
      'application/json',
      'schema',
      'properties',
      'IMDB_rating'
    ]);
    expect(validation.severity).toBe(severityCodes.error);
  });
});
