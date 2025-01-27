import { expect } from 'chai';
import { buildSchema, DocumentNode, graphql, GraphQLInt, GraphQLResolveInfo, Kind, print } from 'graphql';
import { addFieldToInfo, wrapInfo } from '../..';

const schema = buildSchema(`
type Supplier {
  id: Int
  name: String
}

type Product {
  id: Int
  name: String
  supplier: Supplier
}

type Query {
  getProducts(text: String): [Product!]!
}
`);

describe('addFieldToInfo', () => {
  it('add', async () => {
    let info!: GraphQLResolveInfo;
    await graphql(
      schema,
      'query($text: String) { getProducts(text: $text) { name } }',
      {
        getProducts: (args: any, context: any, _info: GraphQLResolveInfo) => {
          info = _info;
        },
      },
      {},
      { text: 'my' },
    );
    const newInfo = addFieldToInfo(info, 'id');
    const document: DocumentNode = {
      definitions: [newInfo.operation],
      kind: Kind.DOCUMENT,
    };
    const expected = 'query ($text: String) { getProducts(text: $text) { name id } }';
    expect(print(document).replace(/\s+/g, ' ').trim()).to.eql(expected);
  });

  it('already exist', async () => {
    let info!: GraphQLResolveInfo;
    await graphql(
      schema,
      'query($text: String) { getProducts(text: $text) { id name } }',
      {
        getProducts: (args: any, context: any, _info: GraphQLResolveInfo) => {
          info = _info;
        },
      },
      {},
      { text: 'my' },
    );
    const newInfo = addFieldToInfo(info, 'id');
    const document: DocumentNode = {
      definitions: [newInfo.operation],
      kind: Kind.DOCUMENT,
    };
    const expected = 'query ($text: String) { getProducts(text: $text) { id name } }';
    expect(print(document).replace(/\s+/g, ' ').trim()).to.eql(expected);
  });

  it('add in path', async () => {
    let info!: GraphQLResolveInfo;
    await graphql(
      schema,
      'query($text: String) { getProducts(text: $text) { name supplier { name } } }',
      {
        getProducts: (args: any, context: any, _info: GraphQLResolveInfo) => {
          info = _info;
        },
      },
      {},
      { text: 'my' },
    );
    const newInfo = addFieldToInfo(info, 'id', { path: 'supplier' });
    const document: DocumentNode = {
      definitions: [newInfo.operation],
      kind: Kind.DOCUMENT,
    };
    const expected = 'query ($text: String) { getProducts(text: $text) { name supplier { name id } } }';
    expect(print(document).replace(/\s+/g, ' ').trim()).to.eql(expected);
  });

  it('wrap', async () => {
    let info!: GraphQLResolveInfo;
    await graphql(
      schema,
      'query($text: String) { getProducts(text: $text) { name } }',
      {
        getProducts: (args: any, context: any, _info: GraphQLResolveInfo) => {
          info = _info;
        },
      },
      {},
      { text: 'my' },
    );
    const newInfo = wrapInfo(info).addField('id');
    const document: DocumentNode = {
      definitions: [newInfo.operation],
      kind: Kind.DOCUMENT,
    };
    const expected = 'query ($text: String) { getProducts(text: $text) { name id } }';
    expect(print(document).replace(/\s+/g, ' ').trim()).to.eql(expected);
  });
});
