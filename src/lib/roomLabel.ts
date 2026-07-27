// estate_rooms.room_type values ("Bridal Suite", "Luxury Suite", "Junior Suite",
// "Garden Suite", "Superior", "Classic") — suites already read naturally on their own,
// non-suite types need " Room" appended to read naturally next to the room number.
export const formatRoomLabel = (type: string | undefined, roomNumber: string | number): string => {
  if (!type) return `Room ${roomNumber}`;
  return /suite/i.test(type) ? `${type} - #${roomNumber}` : `${type} Room - #${roomNumber}`;
};
