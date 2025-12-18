export default function handler(request, response) {
  const gameList = [
    {
      "name": "Super Sus",
      "endpoint": "/api/game/super-sus",
      "hasZoneId": false,
      "listZoneId": null
    },
    {
      "name": "Free Fire",
      "endpoint": "/api/game/free-fire",
      "hasZoneId": false,
      "listZoneId": null
    },
    {
      "name": "Mobile Legends",
      "endpoint": "/api/game/mobile-legends",
      "hasZoneId": true,
      "listZoneId": null
    }
  ];
  
  response.setHeader('Content-Type', 'application/json');
  response.status(200).json({
    status: true,
    data: gameList
  });
}
