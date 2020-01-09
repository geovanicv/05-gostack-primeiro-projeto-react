import React, { Component } from 'react';
import { FaGithubAlt, FaPlus, FaSpinner } from 'react-icons/fa';
import { Link } from 'react-router-dom';

import api from '../../services/api';
import Container from '../../Components/Container/index';

import { Form, List, SubmitButton } from './styles';

export default class Main extends Component {
  state = {
    newRepo: '',
    repositories: [],
    loading: false,
    error: null,
    errorcatched: ''
  };

  // local storage
  // carregar os dados
  componentDidMount() {
    const repositories = localStorage.getItem('repositories');
    if (repositories) {
      this.setState({ repositories: JSON.parse(repositories) });
    }
  }

  // salvar os dados
  componentDidUpdate(_, prevState) {
    const { repositories } = this.state;

    if (prevState.repositories !== repositories) {
      localStorage.setItem('repositories', JSON.stringify(repositories));
    }
  }

  handleInputChange = e => {
    this.setState({ newRepo: e.target.value });
  };

  handleSubmit = async e => {
    e.preventDefault();

    this.setState({ loading: true });

    try {
      const { newRepo, repositories } = this.state;

      if (newRepo === '') throw 'Você precisa indicar um repositório';

      const hasRepo = repositories.find(r => r.name === newRepo);
      if (hasRepo) throw 'Repositório duplicado';

      const response = await api.get(`/repos/${newRepo}`);

      const data = {
        name: response.data.full_name
      };

      this.setState({
        repositories: [...repositories, data],
        newRepo: ''
      });
    } catch (erro) {
      this.setState({ error: true, errorcatched: erro });
    } finally {
      this.setState({ loading: false, newRepo: '' });
    }
  };

  removeRepo = repository => {
    const { repositories } = this.state;

    this.setState({ repositories: repositories.filter(r => r !== repository) });
  };

  render() {
    const { newRepo, loading, repositories, error, errorcatched } = this.state;

    return (
      <Container>
        <h1>
          <FaGithubAlt />
          Repositórios
        </h1>

        <Form onSubmit={this.handleSubmit} error={error}>
          <input
            type="text"
            placeholder={errorcatched || 'Adicionar repositório'}
            value={newRepo}
            onChange={this.handleInputChange}
          />

          <SubmitButton loading={loading}>
            {loading ? (
              <FaSpinner color="#FFF" size={14} />
            ) : (
              <FaPlus color="#FFF" size={14} />
            )}
          </SubmitButton>
        </Form>

        <List>
          {repositories.map(repository => (
            <li key={repository.name}>
              <span>{repository.name}</span>
              <div>
                <Link to={`/repository/${encodeURIComponent(repository.name)}`}>
                  Detalhes
                </Link>
                <button
                  type="button"
                  onClick={() => this.removeRepo(repository)}
                >
                  -
                </button>
              </div>
            </li>
          ))}
        </List>
      </Container>
    );
  }
}
