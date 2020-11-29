import getlongitude from "../getlongitude";

it('returns the longitude given a location', async () => {
  const lng = await getlongitude('42 W Warren Ave, Detroit, MI 48202');
  console.log(lng);

  expect(Number(lng.toFixed(6))).toEqual(-83.065201);
})