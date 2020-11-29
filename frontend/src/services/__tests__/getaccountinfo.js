import getAccountInfo from '../getaccountinfo';

it('return an account given the id', async () => {
  const account = await getAccountInfo('ndASsYo5I');
  console.log(account);

  expect(account.ID).toEqual("ndASsYo5I");
});