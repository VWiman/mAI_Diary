import { createContext, useState } from "react";

export const DiaryContext = createContext();

export const DiaryProvider = ({ children }) => {
	const [isLoading, setIsLoading] = useState(true);
	const [entries, setEntries] = useState([]);
	return (
		<DiaryContext.Provider value={{ isLoading, setIsLoading, entries, setEntries }}>{children}</DiaryContext.Provider>
	);
};
