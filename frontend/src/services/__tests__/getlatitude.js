import getlatitude from "../getlatitude";

it('returns the latitude given a location', async () => {
  const lat = await getlatitude('42 W Warren Ave, Detroit, MI 48202');
  console.log(lat);

  expect(Number(lat.toFixed(6))).toEqual(42.356992);
})