import { createContext, useState } from "react";

export const ApiContext = createContext();

export const ApiProvider = ({ children }) => {
	const [apiResponse, setApiResponse] = useState("");

	const apiKey = process.env.EXPO_PUBLIC_OPEN_API_KEY;

	return <ApiContext.Provider value={{ apiKey, apiResponse, setApiResponse }}>{children}</ApiContext.Provider>;
};
