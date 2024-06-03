import { Tabs, useRouter } from "expo-router";
import { useContext, useEffect } from "react";
import { getAuth, onAuthStateChanged, signOut } from "firebase/auth";
import { useTheme, Button } from "react-native-paper";
import { View } from "react-native";
import { StateContext } from "../../context/stateContext";
import { Spinner } from "../../components/spinner";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { DiaryProvider } from "../../context/diaryContext";
import { ApiProvider } from "../../context/apiContext";

export default function TabLayout() {
	useEffect(() => {
		console.log("TabLayout mounted");
		return () => console.log("TabLayout unmounted");
	}, []);
	const { isLoading, setIsLoading } = useContext(StateContext);
	const router = useRouter();
	const theme = useTheme();
	const auth = getAuth();

	useEffect(() => {
		console.log("Auth object changed", auth);
		console.log("Router object changed", router);

		const unsubscribe = onAuthStateChanged(auth, (user) => {
			if (!user) {
				console.log("User is signed out");
				router.navigate("/landing");
			} else {
				console.log("User is signed in:", user.uid);
			}
			setIsLoading(false);
		});

		return () => unsubscribe();
	}, [auth, router]);


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
				router.navigate("/landing");
			})
			.catch((error) => {
				console.log(error);
			});
	}

	return (
		<ApiProvider>
			<DiaryProvider>
				<Tabs screenOptions={{ tabBarActiveTintColor: theme.colors.secondary }}>
					<Tabs.Screen
						name="index"
						key="index"
						options={() => {
							const theme = useTheme();
							return {
								title: "DIARY",
								headerRight: () => (
									<Button onPress={() => handleLogOut()} mode="text">
										Log out
									</Button>
								),
								tabBarIcon: ({ size }) => (
									<MaterialCommunityIcons name="book-outline" size={size} color={theme.colors.primary} />
								),
							};
						}}
					/>
					<Tabs.Screen
						name="entry"
						key="entry"
						options={() => {
							const theme = useTheme();

							return {
								title: "NEW ENTRY",
								headerRight: () => (
									<Button onPress={() => handleLogOut()} mode="text">
										Log out
									</Button>
								),
								tabBarIcon: ({ size }) => (
									<MaterialCommunityIcons name="pencil" size={size} color={theme.colors.primary} />
								),
							};
						}}
					/>
				</Tabs>
			</DiaryProvider>
		</ApiProvider>
	);
}
