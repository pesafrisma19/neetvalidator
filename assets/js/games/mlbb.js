export async function checkMLBB(userId, serverId) {
  const res = await fetch(
    `/api/mlbb?user_id=${userId}&server_id=${serverId}`
  );

  return await res.json();
}
