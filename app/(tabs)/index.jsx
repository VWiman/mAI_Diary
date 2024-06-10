import { FlatList, Pressable, SafeAreaView, View, useWindowDimensions } from "react-native";
import { Divider, Icon, Text, useTheme } from "react-native-paper";
import { getAuth } from "firebase/auth";
import { getDiaryEntries } from "../../utilities/diaryManager";
import { useContext, useEffect, useState } from "react";
import { DiaryContext } from "../../context/diaryContext";
import { Image } from "expo-image";

export default function Diary() {
	const theme = useTheme();
	const [isSelected, setIsSelected] = useState(false);
	const { entries, setEntries } = useContext(DiaryContext);
	const [selectedEntryId, setSelectedEntryId] = useState(null);
	const { width } = useWindowDimensions();
	const imageSize = width * 0.85;
	const blurhash =
		"|rF?hV%2WCj[ayj[a|j[az_NaeWBj@ayfRayfQfQM{M|azj[azf6fQfQfQIpWXofj[ayj[j[fQayWCoeoeaya}j[ayfQa{oLj?j[WVj[ayayj[fQoff7azayj[ayj[j[ayofayayayj[fQj[ayayj[ayfjj[j[ayjuayj[";
	useEffect(() => {
		const auth = getAuth();
		const user = auth.currentUser;

		const fetchEntries = async () => {
			if (user) {
				const fetchedEntries = await getDiaryEntries(user.uid);
				setEntries(fetchedEntries);
			}
		};

		fetchEntries();
	}, []);

	const handleSelect = (id) => {
		if (selectedEntryId === id) {
			setSelectedEntryId(null);
		} else {
			setSelectedEntryId(id);
		}
	};

	const InnerEntry = ({ item }) => {
		if (selectedEntryId == item.id) {
			return (
				<>
					<Image
						source={item.imagePath}
						placeholder={{ blurhash }}
						contentFit="contain"
						style={{ width: imageSize, height: imageSize, borderRadius: 5 }}
						transition={1000}
					/>
					<Divider bold style={{ width: "100%" }} />
					<Text style={{ paddingHorizontal: 5 }}>{item.text.toString()}</Text>
				</>
			);
		} else {
			return null;
		}
	};

	const renderEntry = ({ item }) => {
		return (
			<>
				<Pressable
					style={{
						flex: 1,
						backgroundColor: theme.colors.surfaceVariant,
						gap: 10,
						padding: 15,
						justifyContent: "center",
						alignItems: "center",
						borderRadius: 5,
					}}>
					<Pressable
						onPress={() => handleSelect(item.id)}
						style={{ flex: 1, flexDirection: "row", alignItems: "center", width: imageSize }}>
						<Icon
							size={24}
							source={selectedEntryId == item.id ? "chevron-down" : "chevron-up"}
							color={theme.colors.primary}
						/>
						<Text variant="titleMedium" style={{ color: theme.colors.primary, fontWeight: "bold" }}>
							{item.title.toString()}
						</Text>
					</Pressable>
					<InnerEntry item={item} />
				</Pressable>
				<Divider style={{ width: "100%", marginVertical: 20 }} />
			</>
		);
	};

	return (
		<SafeAreaView
			style={{
				flex: 1,
				justifyContent: "center",
				alignItems: "center",
				backgroundColor: theme.colors.background,
			}}>
			<FlatList
				style={{ flex: 1, minWidth: "100%", padding: 15 }}
				data={entries}
				renderItem={renderEntry}
				keyExtractor={(item) => item.id.toString()}
				extraData={selectedEntryId}
			/>
		</SafeAreaView>
	);
}
