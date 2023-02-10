import {compile} from '../..';
import {Rule, Violation} from '../../types';

const id: Rule<string> = {
  type: 'string',
  min: 8,
  max: 8,
  pattern: /^[a-z]{8}$/,
};
const name: Rule<string> = {type: 'string', min: 1, max: 63};
const key = name;

const cpu: Rule<number | null> = {
  type: 'number',
  nullable: true,
  min: 0,
  max: 8000,
};
const memory: Rule<number | null> = {
  type: 'number',
  nullable: true,
  min: 0,
  max: 32768,
};

type ResourceMap = {
  cpu?: number | null;
  memory?: number | null;
};

const resourceMap: Rule<ResourceMap | null> = {
  type: 'object',
  nullable: true,
  properties: {
    cpu,
    memory,
  },
};

const image: Rule<string> = {type: 'string', min: 8, max: 200};
const images: Rule<string[] | null> = {
  type: 'array',
  nullable: true,
  items: image,
  min: 1,
  max: 64,
};

enum InstanceStatus {
  Creating = 1,
  Running = 2,
  Deleting = 3,
}
const status: Rule<number> = {
  type: 'integer',
  min: InstanceStatus.Creating,
  max: InstanceStatus.Deleting,
};

type KeyValuePair = {
  key: string;
  value: string;
};

const keyValuePair: Rule<KeyValuePair> = {
  type: 'object',
  properties: {
    key,
    value: {type: 'string', max: 50},
  },
  required: ['key', 'value'],
};

const labels: Rule<KeyValuePair[] | null> = {
  type: 'array',
  nullable: true,
  items: keyValuePair,
  max: 16,
};

type CreateInstanceInput = {
  name: string;
  instanceGroupId: string;
  capacity?: ResourceMap | null;
  images?: string[] | null;
  labels?: KeyValuePair[] | null;
};

const createInstanceInput: Rule<CreateInstanceInput> = {
  type: 'object',
  properties: {
    name,
    instanceGroupId: id,
    capacity: resourceMap,
    images,
    labels,
  },
  required: ['name', 'instanceGroupId'],
};

type UpdateInstanceInput = {
  id: string;
  status: InstanceStatus;
  capacity?: ResourceMap | null;
  images?: string[] | null;
  labels?: KeyValuePair[] | null;
};

const updateInstanceInput: Rule<UpdateInstanceInput> = {
  type: 'object',
  properties: {
    id,
    status,
    capacity: resourceMap,
    images,
    labels,
  },
  required: ['id', 'status'],
};

describe('rules playground', () => {
  it('id', () => {
    expect(cc(id, 'abcdefgh')).toMatchInlineSnapshot(`[]`);
  });

  it('enum', () => {
    expect(cc(status, InstanceStatus.Creating)).toMatchInlineSnapshot(`[]`);
  });

  it('resource map', () => {
    expect(cc(resourceMap, {cpu: 0, memory: 0})).toMatchInlineSnapshot(`[]`);
    expect(cc(resourceMap, {cpu: 1000, memory: 512})).toMatchInlineSnapshot(
      `[]`,
    );
  });

  it('images', () => {
    expect(cc(images, [])).toMatchInlineSnapshot(`
[
  {
    "message": "Required field cannot be left empty.",
    "reason": "array empty",
  },
]
`);
    expect(cc(images, ['test:latest', 'test:stable'])).toMatchInlineSnapshot(
      `[]`,
    );
  });

  it('labels', () => {
    expect(cc(labels, [])).toMatchInlineSnapshot(`[]`);
    expect(cc(labels, [{key: '', value: ''}])).toMatchInlineSnapshot(`
[
  {
    "location": "[0].key",
    "message": "Required field cannot be left blank.",
    "reason": "string blank",
  },
]
`);
  });

  it('create instance input', () => {
    expect(
      cc(createInstanceInput, {
        name: 'test',
        instanceGroupId: 'abcdefgh',
        capacity: {cpu: 1000, memory: 512},
        images: ['test:latest'],
        labels: [{key: 'os', value: 'linux'}],
      }),
    ).toMatchInlineSnapshot(`[]`);
  });

  it('update instance input', () => {
    expect(
      cc(updateInstanceInput, {
        id: 'bdcrfsde',
        status: InstanceStatus.Running,
        capacity: {cpu: 2000, memory: 2048},
        images: ['alpine:latest'],
        labels: [{key: 'kernel/release', value: '6.1.0-amd64'}],
      }),
    );
  });
});

function cc<T>(rule: Rule<T>, input: T) {
  const check = compile(rule);
  const violations: Violation[] = [];
  check(input as T, violations);
  return violations;
}
