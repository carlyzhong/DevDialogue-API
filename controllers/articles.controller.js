const {
  selectArticleById,
  selectArticles,
  updateVotes,
} = require("../models/articles.model");
const { selectTopics, selectTopicsBySlug } = require("../models/topics.model");

exports.getArticleById = (req, res, next) => {
  const { article_id } = req.params;
  selectArticleById(article_id)
    .then((article) => {
      res.status(200).send({ article });
    })
    .catch((err) => {
      next(err);
    });
};

exports.getArticles = (req, res, next) => {
  // Validate query parameters
  const validQueries = ["sort_by", "order", "topic"];
  const receivedQueries = Object.keys(req.query);
  const invalidQueries = receivedQueries.filter(
    (query) => !validQueries.includes(query),
  );

  if (invalidQueries.length > 0) {
    return next({
      status: 400,
      msg: `Invalid parameter: ${invalidQueries}`,
    });
  }

  const { sort_by, order, topic } = req.query;
  const pendingValidTopic = topic
    ? selectTopicsBySlug(topic)
    : Promise.resolve();
  const pendingSelectArticles = selectArticles(sort_by, order, topic);
  Promise.all([pendingSelectArticles, pendingValidTopic])
    .then(([articles]) => {
      res.status(200).send({ articles });
    })
    .catch((err) => {
      next(err);
    });
};

exports.patchNewVotes = (req, res, next) => {
  const { article_id } = req.params;
  const { inc_votes } = req.body;
  if (typeof inc_votes === "number") {
    const pendingArticleIdValid = selectArticleById(article_id);
    const pendingUpdateVotes = updateVotes(article_id, inc_votes);
    Promise.all([pendingUpdateVotes, pendingArticleIdValid])
      .then(([article]) => {
        res.status(200).send({ article });
      })
      .catch((err) => {
        next(err);
      });
  } else {
    next({ status: 400, msg: "Invalid input!" });
  }
};
