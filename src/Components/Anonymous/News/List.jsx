import React, { Component } from 'react';

import Spinner from '../../../Shared/Spinner';

class List extends Component {
	render() {
		const { newsItems } = this.props;

		return (
			<React.Fragment>
				{!!newsItems && <NewsList newsItems={newsItems} />}
				{!newsItems && <EmptyList />}
			</React.Fragment>
		)
	}
}

const NewsList = ({ newsItems }) =>
	<div>
		<div className="l-container">
			<ul>
				{Object.keys(newsItems).map(key =>
					// <p>{key}</p>
					<a href={`/news/${key}`} key={key}>
						<li className="news-item">
							<article className="post">
								<div className="crop-news-img">
									<img className="news-img" src={newsItems[key].imageUrl ? `${newsItems[key].imageUrl}` : null} alt="Article thumbnail" />
								</div>
								<div className="news-content">
									<h1>{newsItems[key].title}</h1>
									{!!newsItems[key].published && <small><time dateTime={newsItems[key].published}>{newsItems[key].published}</time></small>}
									{!!newsItems[key].author && <small>{newsItems[key].author}</small>}
									<p>{newsItems[key].shortText}</p>
								</div>


							</article>
						</li>
					</a>
				)}
			</ul>
		</div>
	</div>

const EmptyList = () =>
	<div>
		<Spinner />
	</div>

export default List;