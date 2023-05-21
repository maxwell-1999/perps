export const Hour = 60n * 60n;
export const Day = Hour * 24n;
export const Year = Day * 365n;

export const last24hrBounds = () => {
  const now = new Date();
  const yesterday = new Date(new Date().setDate(now.getDate() - 1));

  const to = Math.floor(now.setUTCHours(now.getUTCHours(), 59, 59, 999) / 1000);
  const from = Math.floor(yesterday.setUTCHours(yesterday.getUTCHours(), 0, 0, 0) / 1000);

  return { to, from };
};
