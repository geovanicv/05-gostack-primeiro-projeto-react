import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';

import api from '../../services/api';
import Container from '../../Components/Container/index';

import { Owner, Loading, IssuesList, Filter, FilterButton } from './styles';

export default class Repository extends Component {
  state = {
    repository: {},
    issues: [],
    loading: true
  };

  async componentDidMount() {
    this.filtro();
  }

  filtro = async (filtro = 'closed') => {
    const { match } = this.props;
    const repoName = decodeURIComponent(match.params.repository);

    // buscar os dados na api
    // const response = await api.get(`/repos/${repoName}`)
    // const issues = await api.get(`/repos/${repoName}/issues`)

    // melhor maneira para que sejam feitas juntas:
    const [repository, issues] = await Promise.all([
      api.get(`/repos/${repoName}`),
      api.get(`/repos/${repoName}/issues`, {
        params: {
          state: filtro,
          per_page: 5
        }
      })
    ]);

    this.setState({
      repository: repository.data,
      issues: issues.data,
      loading: false
    });

    // console.log(repository);
    // console.log(issues);
  };

  render() {
    const { repository, issues, loading } = this.state;

    if (loading) {
      return <Loading>Carregando</Loading>;
    }

    return (
      <Container>
        <Owner>
          <Link to="/">Voltar aos repositórios</Link>
          <img src={repository.owner.avatar_url} alt={repository.owner.login} />
          <h1>{repository.name}</h1>
          <p>{repository.description}</p>
        </Owner>
        <Filter>
          <FilterButton onClick={() => this.filtro('all')}>Todas</FilterButton>
          <FilterButton onClick={() => this.filtro('open')}>
            Abertas
          </FilterButton>
          <FilterButton onClick={() => this.filtro('closed')}>
            Fechadas
          </FilterButton>
        </Filter>
        <IssuesList>
          {issues.map(issue => (
            <li key={String(issue.id)}>
              <img src={issue.user.avatar_url} alt={issue.user.login} />
              <div>
                <strong>
                  <a href={issue.html_url}>{issue.title}</a>
                  {issue.labels.map(label => (
                    <span key={String(label.id)}>{label.name}</span>
                  ))}
                </strong>
                <p>{issue.user.login}</p>
              </div>
            </li>
          ))}
        </IssuesList>
      </Container>
    );
  }
}
// validação de propriedades
// sao as propriedades passadas pro componente como parametros atraves da URL
Repository.propTypes = {
  match: PropTypes.shape({
    params: PropTypes.shape({
      repository: PropTypes.string
    })
  }).isRequired
};
