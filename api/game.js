// File: api/game.js - API untuk daftar semua game
export default function handler(request, response) {
  const gameList = [
    {
      "name": "Super Sus",
      "endpoint": "/api/game/supersus",
      "hasZoneId": false,
      "listZoneId": null
    },
    {
      "name": "Mobile Legends",
      "endpoint": "/api/game/mobile-legends",
      "hasZoneId": true,
      "listZoneId": "/api/game/get-zone/mobile-legends"
    },
    {
      "name": "Free Fire",
      "endpoint": "/api/game/free-fire",
      "hasZoneId": false,
      "listZoneId": null
    },
    {
      "name": "PUBG Mobile",
      "endpoint": "/api/game/pubg-mobile",
      "hasZoneId": true,
      "listZoneId": "/api/game/get-zone/pubg-mobile"
    }
  ];
  
  response.status(200).json({
    status: true,
    data: gameList
  });
}
