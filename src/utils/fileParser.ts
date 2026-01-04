interface ParsedFileInfo {
  plantId: string;
  latitude: number;
  longitude: number;
  isValid: boolean;
}

export const parsePlantFilename = (filename: string): ParsedFileInfo => {
  const regex = /^(\d+)_latitude_([\d\.]+)_longitude_([\d\.]+)/;
  const match = filename.match(regex);

  if (match) {
    return {
      plantId: match[1],
      latitude: parseFloat(match[2]),
      longitude: parseFloat(match[3]),
      isValid: true,
    };
  }

  return { plantId: "", latitude: 0, longitude: 0, isValid: false };
};
