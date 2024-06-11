import { useRouter } from "expo-router";
import { View } from "react-native";
import { useTheme, Text, Button } from "react-native-paper";

export default function LandingScreen() {
	const router = useRouter();
	const theme = useTheme();
	return (
		<View
			style={{
				flex: 1,
				justifyContent: "center",
				alignItems: "center",
				backgroundColor: theme.colors.background,
				gap: 12,
			}}>
		
			<Text variant="displayMedium">mAI Diary</Text>
			<Button style={{ width: 125 }} mode="contained" onPress={() => router.push("/login")}>
				Login
			</Button>
			<Button style={{ width: 125 }} mode="contained" onPress={() => router.push("/register")}>
				Register
			</Button>
		</View>
	);
}
