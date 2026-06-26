import api from '@/services/AxiosInstance';
import { jwtDecode } from "jwt-decode";

export const getUserIdFromToken = (accessToken: string) : number | null => 
{
	if (accessToken.length === 0) return null
	const decodedToken: any = jwtDecode(accessToken);
	const userId: number = decodedToken.sub;
	return userId;
}

export const hexToRgba = (hex: string, alpha = 1) => 
{
	const cleanHex = hex.replace('#', '');
	const bigint = parseInt(cleanHex, 16);

	const r = (bigint >> 16) & 255;
	const g = (bigint >> 8) & 255;
	const b = bigint & 255;

	return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};

export const formatData = (data: any[], numColumns: number) => 
{
	// source: https://www.youtube.com/watch?v=8wv0kjsirso
	const copyData = [...data];
	const numberOfFullRows = Math.floor(copyData.length / numColumns);
	let numberOfElementsLastRow = copyData.length - numberOfFullRows * numColumns;
	while (numberOfElementsLastRow !== numColumns && numberOfElementsLastRow !== 0) 
	{
		copyData.push({});
		numberOfElementsLastRow++;
	}
	return copyData;
};

export const blobToBase64 = (blob: Blob) : Promise<string | ArrayBuffer | null> => 
{
	return new Promise((resolve, reject) => 
	{
		const reader = new FileReader()
		reader.onloadend = () => resolve(reader.result)
		reader.onerror = reject
		reader.readAsDataURL(blob)
	})
};

export const getImageBase64 = async (imageId: string) : Promise<string> => 
{
	try
	{
		const blob = (await api.get(`/images/${imageId}`, {
			responseType: 'blob',
		}))?.data
		const imageBase64 = await blobToBase64(blob)
		if (imageBase64 instanceof ArrayBuffer) return ""
		if (imageBase64 === null) return ""
		else return imageBase64
	}
	catch
	{
		return ""
	}
}