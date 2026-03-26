declare global {
	namespace PrismaJson {
		type StationLocation = {
			address: string;
			lat: number;
			lng: number;
		};
	}
}

export {};
