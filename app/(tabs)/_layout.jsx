import { Tabs, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { getAuth, onAuthStateChanged, signOut } from "firebase/auth";
import { useTheme, Button, Icon, Text } from "react-native-paper";
import { Pressable, View } from "react-native";
import { Spinner } from "../../components/spinner";
import { DiaryProvider } from "../../context/diaryContext";
import { ApiProvider } from "../../context/apiContext";

export default function TabLayout() {
	const [isAuthLoading, setIsAuthLoading] = useState(true);
	const router = useRouter();
	const theme = useTheme();
	const auth = getAuth();

	useEffect(() => {
		const unsubscribe = onAuthStateChanged(auth, (user) => {
			if (!user) {
				router.replace("/landing");
			}
			setIsAuthLoading(false);
		});

		return () => unsubscribe();
	}, [auth, router]);

	if (isAuthLoading)
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
				console.error("Logout failed:", error);
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
								headerRight: () => (
									<Pressable
										style={{
											flex: 1,
											flexDirection: "row",
											alignItems: "center",
											padding: 5,
											gap: 2,
											marginHorizontal: 10,
											borderRadius: 5,
										}}
										onPress={() => handleLogOut()}>
										<Text
											style={{
												fontWeight: "bold",
												fontSize: 10,
												textTransform: "uppercase",
												color: theme.colors.primary,
											}}>
											log out
										</Text>
										<Icon color={theme.colors.primary} size={10} source={"logout"} />
									</Pressable>
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
								headerRight: () => (
									<Pressable style={ {flex: 1, flexDirection: "row", alignItems:"center", padding: 5, gap: 2, marginHorizontal: 10, borderRadius: 5}} onPress={() => handleLogOut()}>
										<Text style={{fontWeight: "bold", fontSize: 10, textTransform: "uppercase", color: theme.colors.primary}}>log out</Text>
										<Icon color={theme.colors.primary} size={10} source={"logout"} />
									</Pressable>
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
