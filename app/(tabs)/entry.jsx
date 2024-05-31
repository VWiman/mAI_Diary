import { View } from "react-native";
import { useTheme } from "react-native-paper";

export default function Entry() {
	const theme = useTheme();
	return (
		<View
			style={{
				flex: 1,
				justifyContent: "center",
				alignItems: "center",
				backgroundColor: theme.colors.background,
			}}></View>
	);
}
