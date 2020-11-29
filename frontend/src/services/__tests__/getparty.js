import getparty from "../getparty";

it('returns a party given an id', async () => {
  const party = await getparty('m0zSDBPO5');
  console.log(party);

  expect(party.ID).toEqual("m0zSDBPO5");
});