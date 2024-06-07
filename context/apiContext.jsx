import { createContext, useState } from "react";

export const ApiContext = createContext();

export const ApiProvider = ({ children }) => {
	const [apiResponse, setApiResponse] = useState("");
	const [imageApiResponse, setImageApiResponse] = useState(null)
	const [displayResult, setDisplayResult] = useState("");
	const apiKey = process.env.EXPO_PUBLIC_OPEN_API_KEY;
	const weatherApiKey = process.env.EXPO_PUBLIC_WEATHER_API_KEY;

	return (
		<ApiContext.Provider
			value={{
				apiKey,
				weatherApiKey,
				apiResponse,
				setApiResponse,
				displayResult,
				setDisplayResult,
				imageApiResponse,
				setImageApiResponse,
			}}>
			{children}
		</ApiContext.Provider>
	);
};
