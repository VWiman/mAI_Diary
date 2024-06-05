import React, { useContext } from "react";
import { SafeAreaView, ScrollView, View, useWindowDimensions } from "react-native";
import { Button, Divider, Surface, Text, useTheme } from "react-native-paper";
import { ApiContext } from "../../context/apiContext";
import { router } from "expo-router";

export default function Result() {
	const theme = useTheme();
	const { width } = useWindowDimensions();
	const { displayResult, setDisplayResult } = useContext(ApiContext);

	return (
		<SafeAreaView
			style={{
				flex: 1,
				justifyContent: "center",
				alignItems: "center",
				backgroundColor: theme.colors.background,
			}}>
			<ScrollView style={{ minWidth: "100%", paddingHorizontal: width / 10, paddingTop: 20 }}>
				<Surface
					elevation={2}
					style={{ backgroundColor: theme.colors.surfaceVariant, padding: 20, marginBottom: 80, borderRadius: 5 }}>
					<Text>{displayResult}</Text>
				</Surface>
			</ScrollView>

			<View
				style={{
					position: "absolute",
					bottom: 10,
					width: "100%",
					backgroundColor: "rgba(255, 255, 255, 0)",
					justifyContent: "center",
					alignItems: "center",
					height: 50,
					flexDirection: "row",
					gap: 10,
				}}>
				<Button
					onPress={() => {
						router.navigate("/");
					}}
					style={{ width: 125 }}
					mode="contained"
					disabled={!displayResult}>
					Save
				</Button>
				<Button
					onPress={() => {
						setDisplayResult(""), router.navigate("/entry");
					}}
					style={{ width: 125 }}
					mode="contained"
					disabled={!displayResult}>
					Dismiss
				</Button>
			</View>
		</SafeAreaView>
	);
}
