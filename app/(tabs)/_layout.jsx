import { Tabs, useRouter } from "expo-router";
import { useContext, useEffect } from "react";
import { getAuth, onAuthStateChanged, signOut } from "firebase/auth";
import { useTheme, Button, Icon } from "react-native-paper";
import { View } from "react-native";
import { StateContext } from "../../context/stateContext";
import { Spinner } from "../../components/spinner";
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
				<Tabs
					screenOptions={{
						tabBarActiveTintColor: theme.colors.secondary,
						tabBarInactiveTintColor: theme.colors.onSurfaceDisabled,
					}}>
					<Tabs.Screen
						name="index"
						key="index"
						options={() => {
							return {
								title: "DIARY",
								headerRight: ({ size, color }) => (
									<Button onPress={() => handleLogOut()} mode="text">
										Log out <Icon source={"logout"} size={size} color={color} />
									</Button>
								),
								tabBarIcon: ({ size, color }) => <Icon source="book-outline" size={size} color={color} />,
							};
						}}
					/>
					<Tabs.Screen
						name="entry"
						key="entry"
						options={() => {
							return {
								title: "NEW ENTRY",
								headerRight: ({ size, color }) => (
									<Button onPress={() => handleLogOut()} mode="text">
										Log out <Icon source={"logout"} size={size} color={color} />
									</Button>
								),
								tabBarIcon: ({ size, color }) => <Icon source="pencil-outline" size={size} color={color} />,
							};
						}}
					/>
					<Tabs.Screen
						name="result"
						options={{
							href: null,
							title: "RESULT",
							headerRight: ({ size, color }) => (
								<Button onPress={() => handleLogOut()} mode="text">
									Log out <Icon source={"logout"} size={size} color={color} />
								</Button>
							),
							headerLeft: () => <Button icon={"close"} onPress={() => router.navigate("/entry")} mode="text" />,
						}}
					/>
				</Tabs>
			</DiaryProvider>
		</ApiProvider>
	);
}
