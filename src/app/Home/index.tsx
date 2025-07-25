import { Alert, FlatList, Image, Text, TouchableOpacity, View } from "react-native"

import { styles } from "./styles"
import { Button } from "@/components/Button"
import { Input } from "@/components/Input"
import { Filter } from "@/components/Filter"
import { FilterStatus } from "@/types/FilterStatus"
import { Item } from "@/components/Item"
import { useEffect, useState } from "react"
import { itemsStorage, ItemsStorage } from "@/storage/itemsStorage"

const FILTER_STATUS: FilterStatus[] = [FilterStatus.PENDING, FilterStatus.DONE]

export function Home() {
  const [filter, setFilter] = useState(FilterStatus.PENDING)
  const [description, setDescription] = useState("")
  const [items, setItems] = useState<ItemsStorage[]>([])

  async function handleAdd() {
    if (!description.trim()) {
      return Alert.alert("Add Item", "Please enter a description to add the item.")
    }

    const newItem = {
      id: Math.random().toString().substring(2),
      description,
      status: FilterStatus.PENDING,
    }

    await itemsStorage.add(newItem)
    await itemsByStatus()

    Alert.alert("Added", `Added ${description}`)
    setFilter(FilterStatus.PENDING)
    setDescription("")
  }

  async function itemsByStatus() {
    try {
      const response = await itemsStorage.getByStatus(filter)
      setItems(response)
    } catch (error) {
      console.log(error)
      Alert.alert("Error", "Could not filter the items.")
    }
  }

  async function handleRemove(id: string) {
    try {
      await itemsStorage.remove(id)
      await itemsByStatus()
    } catch (error) {
      console.log(error)
      Alert.alert("Remove", "Could not remove the item.")
    }
  }

  function handleClear() {
    Alert.alert("Clear", "Do you want to remove all items?", [
      { text: "No", style: "cancel" },
      { text: "Yes", onPress: () => onClear()}
    ])
  }

  async function onClear() {
    try {
      await itemsStorage.clear()
      setItems([])
    } catch (error) {
      console.log(error)
      Alert.alert("Clear", "Could not remove all items.")
    }
  }

  async function handleToggleItemStatus(id: string) {
    try {
      await itemsStorage.toggleStatus(id)
      await itemsByStatus()
    } catch (error) {
      console.log(error)
      Alert.alert("Error", "Could not update the item status.")
    }
  }

  useEffect(() => {
    itemsByStatus()
  }, [filter])

  return (
    <View style={styles.container}>
      <Image source={require('@/assets/logo.png')} style={styles.logo} />

      <View style={styles.form}
      >
        <Input 
          placeholder="What do you need to buy?" 
          onChangeText={setDescription}
          value={description}
        />
        <Button title="Add" onPress={handleAdd} />
      </View>

      <View style={styles.content}>
        <View style={styles.header}>
          {FILTER_STATUS.map((status) => (
            <Filter
               key={status}
               status={status} 
               isActive={filter === status}
               onPress={() => setFilter(status)} 
            />
          ))}

          <TouchableOpacity style={styles.clearButton} onPress={handleClear}>
            <Text style={styles.clearText}>Clear</Text>
          </TouchableOpacity>
        </View>

        <FlatList 
          data={items}
          keyExtractor={item => item.id}
          renderItem={({ item }) => (
            <Item
              data={item} 
              onStatus={() => handleToggleItemStatus(item.id)}
              onRemove={() => handleRemove(item.id)}
            />
          )}
          showsVerticalScrollIndicator={false}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={() => <Text style={styles.empty}>No items here.</Text>}
        />
      </View>
    </View>
  )
}