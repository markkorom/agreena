import axios from "axios";

const drivingDistanceBaseUrl = "http://router.project-osrm.org/table/v1/driving";

export interface DrivingDistanceInterface {
  code: string;
  destinations: DestinationInterface[];
  durations: number[][];
  sources: DestinationInterface[];
}

interface DestinationInterface {
  hint: string;
  distance: number;
  name: string;
  location: number[];
}

/**
 * Return unsorted distance array.
 * First element of the array is the starting point.
 * The array keeps the original coordinates order.
 * @param coordinates
 * @returns
 */
export async function getDrivingDistances(coordinates: number[][]): Promise<number[]> {
  try {
    const response = await axios.get<{ distances: number[][] }>(
      `${drivingDistanceBaseUrl}/${coordinates.join(";")}?annotations=distance`,
    );
    return response.data.distances[0];
  } catch (error) {
    console.debug(error);
    throw new Error(`Error from ${drivingDistanceBaseUrl}.`);
  }
}
