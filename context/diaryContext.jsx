import { createContext, useState } from "react";

export const DiaryContext = createContext();

export const DiaryProvider = ({ children }) => {
	const [isLoading, setIsLoading] = useState(true);
	return <DiaryContext.Provider value={{ isLoading, setIsLoading }}>{children}</DiaryContext.Provider>;
};
