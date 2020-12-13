import getParties from "../getParties";

it('returns any party', async () => {
    const party = await getParties();
    console.log(party);

    expect(party.ID).toNotEqual(NULL);
})