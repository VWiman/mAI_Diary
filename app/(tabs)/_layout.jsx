import { Link, Tabs, useRouter } from "expo-router";
import { useState } from "react";
import { getAuth, signOut } from "firebase/auth";
import { Text, useTheme, Button } from "react-native-paper";
import { View } from "react-native";

export default function TabLayout() {
	const [isLoading, setIsLoading] = useState(true);
	const router = useRouter();
	const theme = useTheme();

	getAuth().onAuthStateChanged((user) => {
		setIsLoading(false);
		if (!user) {
			router.replace("/landing");
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
				<Text>Loading...</Text>
			</View>
		);

	function handleLogOut() {
		const auth = getAuth();
		signOut(auth)
			.then(() => {
				router.replace("/landing");
			})
			.catch((error) => {
				console.log(error)
				// An error happened.
			});
	}

	return (
		<Tabs>
			<Tabs.Screen
				name="index"
				options={{
					title: "DIARY",
					headerRight: () => <Button onPress={() => handleLogOut()}>Log out</Button>,
				}}
			/>
			<Tabs.Screen
				name="entry"
				options={{
					title: "NEW ENTRY",
					headerRight: () => <Button onPress={() => handleLogOut()}>Log out</Button>,
				}}
			/>
		</Tabs>
	);
}
