import { createContext, useState } from "react";

export const ApiContext = createContext();

export const ApiProvider = ({ children }) => {
	const [apiResponse, setApiResponse] = useState("");
	const [displayResult, setDisplayResult] = useState("");
	const apiKey = process.env.EXPO_PUBLIC_OPEN_API_KEY;

	return (
		<ApiContext.Provider value={{ apiKey, apiResponse, setApiResponse, displayResult, setDisplayResult }}>
			{children}
		</ApiContext.Provider>
	);
};
