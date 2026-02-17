import { FlatList, Pressable, SafeAreaView, View, useWindowDimensions } from "react-native";
import { Divider, Icon, IconButton, Text, useTheme } from "react-native-paper";
import { getAuth } from "firebase/auth";
import { getDiaryEntries, deleteDiaryEntry } from "../../utilities/diaryManager";
import { useContext, useEffect, useRef, useState } from "react";
import { DiaryContext } from "../../context/diaryContext";
import { Image } from "expo-image";

export default function Diary() {
	const theme = useTheme();
	const { entries, setEntries } = useContext(DiaryContext);
	const [selectedEntryId, setSelectedEntryId] = useState(null);
	const { width } = useWindowDimensions();
	const flatListRef = useRef();
	const imageSize = width * 0.85;
	const blurhash =
		"|rF?hV%2WCj[ayj[a|j[az_NaeWBj@ayfRayfQfQM{M|azj[azf6fQfQfQIpWXofj[ayj[j[fQayWCoeoeaya}j[ayfQa{oLj?j[WVj[ayayj[fQoff7azayj[ayj[j[ayofayayayj[fQj[ayayj[ayfjj[j[ayjuayj[";
	const [isDeleting, setIsDeleting] = useState(false);

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

	useEffect(() => {
		const auth = getAuth();
		const user = auth.currentUser;

		const updatedEntries = async () => {
			if (user && isDeleting) {
				const fetchedEntries = await getDiaryEntries(user.uid);
				setEntries(fetchedEntries);
				setIsDeleting(false);
			}
		};
		updatedEntries();
	}, [entries, isDeleting]);

	const handleSelect = (id) => {
		const index = entries.findIndex((entry) => entry.id === id);
		if (selectedEntryId === id) {
			setSelectedEntryId(null);
		} else {
			setSelectedEntryId(id);
			flatListRef.current.scrollToIndex({ animated: true, index: index });
		}
	};

	const InnerEntry = ({ item }) => {
		if (selectedEntryId == item.id) {
			return (
				<View style={{ flex: 1, gap: 10, alignItems: "center", paddingHorizontal: 15, paddingBottom: 15 }}>
					<Image
						source={item.imagePath}
						placeholder={{ blurhash }}
						contentFit="fill"
						style={{ minWidth: imageSize, minHeight: imageSize, borderRadius: 5 }}
						transition={1000}
					/>
					<Divider bold style={{ width: "100%" }} />
					<Text style={{ paddingHorizontal: 5 }}>{item.text.toString()}</Text>
				</View>
			);
		} else {
			return null;
		}
	};

	const handleDelete = async (id) => {
		setIsDeleting(true);
		const auth = getAuth();
		const user = auth.currentUser;
		const entryIndex = entries.findIndex((entry) => entry.id === id);
		if (entryIndex !== -1) {
			await deleteDiaryEntry(user.uid, entryIndex);
		} else {
			console.error("Entry not found for deletion");
		}
	};

	const renderEntry = ({ item }) => {
		return (
			<View
				style={{
					flex: 1,
					width: width - 20,
					paddingTop: 5,
					margin: 5,
				}}>
				<Pressable
					style={{
						flex: 1,
						backgroundColor: theme.colors.surfaceVariant,
						borderRadius: 5,
					}}>
					<View style={{ flex: 1, flexDirection: "row" }}>
						<Pressable
							onPress={() => handleSelect(item.id)}
							style={{ flex: 1, flexDirection: "row", marginLeft: 10, alignItems: "center", width: imageSize }}>
							<Icon
								size={24}
								source={selectedEntryId == item.id ? "chevron-down" : "chevron-up"}
								color={theme.colors.primary}
							/>
							<Text variant="titleMedium" style={{ color: theme.colors.primary, fontWeight: "bold" }}>
								{item.title.toString()}
							</Text>
						</Pressable>
						<IconButton
							icon="trash-can-outline"
							iconColor={theme.colors.error}
							onPress={() => {
								handleDelete(item.id);
							}}
						/>
					</View>
					<InnerEntry item={item} />
				</Pressable>
			</View>
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
				ref={flatListRef}
				data={entries}
				renderItem={renderEntry}
				keyExtractor={(item) => item.id.toString()}
				extraData={selectedEntryId}
			/>
		</SafeAreaView>
	);
}
