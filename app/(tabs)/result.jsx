import { useContext } from "react";
import { SafeAreaView, ScrollView, View, useWindowDimensions } from "react-native";
import { Button, Divider, Surface, Text, useTheme } from "react-native-paper";
import { ApiContext } from "../../context/apiContext";
import { router } from "expo-router";
import { Image } from "expo-image";

export default function Result() {
	const theme = useTheme();
	const { width } = useWindowDimensions();
	const { displayResult, setDisplayResult, imageApiResponse, setImageApiResponse } = useContext(ApiContext);
	const imageSize = width * 0.85;
	const blurhash =
		"|rF?hV%2WCj[ayj[a|j[az_NaeWBj@ayfRayfQfQM{M|azj[azf6fQfQfQIpWXofj[ayj[j[fQayWCoeoeaya}j[ayfQa{oLj?j[WVj[ayayj[fQoff7azayj[ayj[j[ayofayayayj[fQj[ayayj[ayfjj[j[ayjuayj[";

	return (
		<SafeAreaView
			style={{
				flex: 1,
				justifyContent: "center",
				alignItems: "center",
				backgroundColor: theme.colors.background,
			}}>
			<ScrollView style={{ flex: 1, minWidth: "100%", padding: width / 25 }}>
				<Surface
					elevation={2}
					style={{
						backgroundColor: theme.colors.surfaceVariant,
						gap: 20,
						padding: 15,
						justifyContent: "center",
						alignItems: "center",
						marginBottom: 80,
						borderRadius: 5,
					}}>
					<Image
						source={imageApiResponse}
						placeholder={{ blurhash }}
						contentFit="contain"
						style={{ width: imageSize, height: imageSize, borderRadius: 5 }}
						transition={1000}
					/>
					<Divider bold style={{ width: "100%" }} />
					<Text style={{ paddingHorizontal: 5 }}>{displayResult}</Text>
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
						setDisplayResult(""), setImageApiResponse(null), router.navigate("/entry");
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
