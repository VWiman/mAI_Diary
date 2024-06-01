import { Tabs, useRouter } from "expo-router";
import { useContext } from "react";
import { getAuth, signOut } from "firebase/auth";
import { useTheme, Button } from "react-native-paper";
import { View } from "react-native";
import { StateContext } from "../../context/stateContext";
import { Spinner } from "../../components/spinner";
import { MaterialCommunityIcons } from "@expo/vector-icons";

export default function TabLayout() {
	const { isLoading, setIsLoading } = useContext(StateContext);
	const router = useRouter();
	const theme = useTheme();

	getAuth().onAuthStateChanged((user) => {
		setIsLoading(false);
		if (!user) {
			console.log("User is signed out");
			router.replace("/landing");
		} else {
			console.log("User is signed in:", user.uid);
			
		}
	});

	if (isLoading)
		return (
			<View
				style={{
					flex: 1,
					justifyContent: "center",
					alignItems: "center",
					backgroundColor: theme.colors.background,
				}}>
				<Spinner theme={theme} />
			</View>
		);

	function handleLogOut() {
		const auth = getAuth();
		signOut(auth)
			.then(() => {
				router.replace("/landing");
			})
			.catch((error) => {
				console.log(error);
				// An error happened.
			});
	}

	return (
		<Tabs screenOptions={{ tabBarActiveTintColor: theme.colors.secondary }}>
			<Tabs.Screen
				name="index"
				options={({ navigation }) => {
					const theme = useTheme(); // Access theme within the options function

					return {
						title: "DIARY",
						headerRight: () => (
							<Button onPress={() => handleLogOut()} mode="text">
								Log out
							</Button> // React Native Paper Button
						),
						tabBarIcon: ({ color, size }) => (
							<MaterialCommunityIcons name="book-outline" size={size} color={theme.colors.primary} /> // Customize icon name and theme color
						),
					};
				}}
			/>
			<Tabs.Screen
				name="entry"
				options={({ navigation }) => {
					const theme = useTheme(); // Access theme within the options function

					return {
						title: "NEW ENTRY",
						headerRight: () => (
							<Button onPress={() => handleLogOut()} mode="text">
								Log out
							</Button> // React Native Paper Button
						),
						tabBarIcon: ({ color, size }) => (
							<MaterialCommunityIcons name="pencil" size={size} color={theme.colors.primary} /> // Customize icon name and theme color
						),
					};
				}}
			/>
		</Tabs>
	);
}
