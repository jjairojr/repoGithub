import React, {useState, useEffect} from 'react'
import Icon from 'react-native-vector-icons/MaterialIcons'
import { Keyboard } from 'react-native'
import { Container, Title, Form, Input, Submit, List } from './styles'
import api from '~/services/api'
import getRealm from '~/services/realm'

import Repository from '~/components/Repository'

export default function Main() {
  const [input, setInput] = useState('')
  const [error, setError] = useState(false)
  const [repositories, setRepositories] = useState(false)

  useEffect(() => {
    async function loadRepositories() {
      const realm = await getRealm()

      const data = realm.objects('Repository').sorted('stars', true)
      setRepositories(data);
      console.tron.log(data)
    }


    loadRepositories();
  }, [])

  async function saveRepository(repository) {
    const data = {
      language: repository.language,
      id: repository.id,
      name: repository.name,
      fullName: repository.full_name,
      description: repository.description,
      stars: repository.stargazers_count,
      forks: repository.forks_count,
    }


    const realm = await getRealm()

    realm.write(() => {
      realm.create('Repository', data, 'modified')
    })

    return data;
  }

  async function handleAddRepository() {
    try {
      const response = await api.get(`/repos/${input}`)
      await saveRepository(response.data)
      console.tron.log(response.data)
      setInput("")
      Keyboard.dismiss()
      setError(false)

    } catch (err) {
      setError(true)
      console.tron.log('Erro', err)
    }
  }

  async function handleRefreshRepository(repository) {
    const response = await api.get(`/repos/${repository.fullName}`)

   const data = await saveRepository(response.data);

   setRepositories(repositories.map(repo => repo.id === data.id ? data : repo))
   console.tron.log('teste')
  }

  return (
    <Container>
      <Title>Repositórios</Title>
      <Form>
        <Input
        value={input}
        error={error}
        onChangeText={setInput}
        autoCapitalize="none"
        autoCorrect={false}
        placeholder="Procurar repositório..."
        />
        <Submit onPress={handleAddRepository}>
        <Icon name="add" size={22} color="#fff"/>
        </Submit>
      </Form>

      <List
        keyboardShouldPersistTaps="handled"
        data={repositories}
        keyExtractor={item => String(item.id)}
        renderItem={({ item }) => (
          <Repository data={item} onRefresh={() => handleRefreshRepository(item)}/>
        )}
      />
    </Container>
  )
}
