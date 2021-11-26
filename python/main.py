from math import sqrt
from networkx.algorithms.operators.unary import reverse
import numpy as np
import json
from numpy.core.fromnumeric import sort
import pandas as pd
from sklearn.preprocessing import StandardScaler
from sklearn.decomposition import PCA
import matplotlib.pyplot as plt
import networkx as nx
import pygraphviz as pgv
import sys
import spotipy
from spotipy.oauth2 import SpotifyClientCredentials


def get_playlist_tracks(sp, username, playlist_id):
    results = sp.user_playlist_tracks(username, playlist_id)
    tracks = results['items']
    while results['next']:
        results = sp.next(results)
        tracks.extend(results['items'])
    return tracks
    

def call_spotify_API(playlist_id):
    cid = "c79989282f4f40a2953b4adc36489afc"
    secret = "6357449b2d3a464cb5a6754dc0bc3398"
    ccm = SpotifyClientCredentials(client_id=cid, client_secret=secret)
    sp = spotipy.Spotify(client_credentials_manager=ccm)
    sp.trace = False

    # Should probs split into another method here

    # Get playlist tracks
    tracks = get_playlist_tracks(sp, "joetebbett", playlist_id)

    # Get metadata and features for tracks
    titles = [t["track"]["name"] for t in tracks]
    artists = [t["track"]["artists"][0] for t in tracks]

    artist_ids = [a["id"] for a in artists]
    artist_names = [a["name"] for a in artists]
    artists_full = sp.artists(artist_ids)["artists"]

    track_ids = [t["track"]["id"] for t in tracks]
    features_list = sp.audio_features(track_ids)
    

    genres_list = [a["genres"] for a in artists_full]
    genres = ["no genre listed" if len(glist) == 0 else glist[0] for glist in genres_list]

    # Remove unwanted features
    to_remove = ["time_signature", "duration_ms", "type",
                 "id", "uri", "track_href", "analysis_url"]
    for features in features_list:
        for k in to_remove:
            features.pop(k)

    df = pd.DataFrame(features_list, index=titles)
    df.insert(0, "artist", artist_names)
    df.insert(1, "genre", genres)
    df.insert(2, "id", track_ids)

    return df


def pca(feature_df):

    # Standardise data
    features = list(feature_df.columns)
    
    x = df.loc[:, features].values
    x = StandardScaler().fit_transform(x)

    # Do PCA
    pca = PCA(n_components=2)
    principal_components = pca.fit_transform(x)
    principal_df = pd.DataFrame(data=principal_components,
                               columns=["PC1", "PC2"])

    return principal_df


def plot(princ_df, titles):
    fig = plt.figure(figsize=(15, 15))
    ax = fig.add_subplot(1, 1, 1)
    ax.set_xlabel('Principal Component 1', fontsize=15)
    ax.set_ylabel('Principal Component 2', fontsize=15)
    ax.set_title('2 component PCA', fontsize=20)
    x_vals = princ_df.loc[:, 'PC1']
    y_vals = princ_df.loc[:, 'PC2']
    ax.scatter(x_vals, y_vals, s=50)
    for i, title in enumerate(titles):
      ax.annotate(title, (x_vals[i], y_vals[i]))
    ax.grid()
    plt.show()

def make_graph(adj_df, titles):

    n = len(titles)
    dist_mtx = np.zeros((n , n))

    # Not idiomatic to iterate over dataframe but this is a just a proof of concept
    for i, row1 in adj_df.iterrows():
        x1 = row1["PC1"]
        y1 = row1["PC2"]
        for j, row2 in adj_df.iterrows():
            x2 = row2["PC1"]
            y2 = row2["PC2"]

            d = sqrt((x1 - x2) ** 2 + (y1 - y2) ** 2)
            dist_mtx[i][j] = d

    # Remove all but the m lowest distances
    m = 4 
    
    adj_mtx = [[0] * n for _ in range(n)]
    
    for i, row in enumerate(dist_mtx):
        closest_m = sorted(row)[1:m + 1]
        for j, val in enumerate(row):
            edge = 1.0 if val in closest_m else 0.0
            adj_mtx[i][j] = edge
            adj_mtx[j][i] = edge

    retdf = pd.DataFrame(adj_mtx, columns=titles, index=titles)
    return retdf



if __name__ == "__main__":
    if len(sys.argv) == 2 and sys.argv[1] == "d":
        # playlist_id = "4EM1OS6ZniaUyQCCaDdNAF" #
        # playlist_id = "3BWJBOdppofO9BPK1fhRfq" # DOESN'T WORK - 3000+ song playlist
        # playlist_id = "4uGlvnVyIRtuY8gBrxLOV7" # 
        # playlist_id = "2fmevx1wCMDHfAMmuUQeuv" # DOESN'T WORK - 300 song playlist
        playlist_id = "2OQsYuSwK3RLC6rBI1Y53d" # PCA test 1
        # playlist_id = "2J6vjn5m6P2L2AnaoKdmvj" # PCA test 2
        df = call_spotify_API(playlist_id=playlist_id)
        df.to_pickle("./playlist.pkl")
    else:
        df = pd.read_pickle("./playlist.pkl")

    artists = df["artist"].tolist()
    genres = df["genre"].tolist()
    track_ids = df["id"].tolist()

    df = df.drop(columns=["artist","genre","id"])

    princdf = pca(df)
    titles = list(df.index)
    adj_df = make_graph(princdf, titles)


    graph = nx.from_numpy_array(adj_df.values)
    graph = nx.relabel_nodes(graph, dict(enumerate(titles)))

    # Change column/row titles to track ids
    adj_df.columns = track_ids
    adj_df.index = track_ids
    
    print(adj_df)

    adj_df.values[[np.arange(len(adj_df))] * 2] = np.nan
    edge_df = adj_df.stack().reset_index()

    nodes = [{"id": id, "title": t, "artist": a, "genre": g} 
        for (id, t, a, g) in zip(track_ids, titles, artists, genres)]

    edge_df.columns = ["src_id", "tgt_id", "val"]

    edges = [edge for edge in edge_df.to_dict("records") if edge["val"] != 0]

    out = { "nodes": nodes, "edges": edges }

    with open("graph.json", "w") as outfile:
        json.dump(out, outfile)

    nx.drawing.nx_pydot.write_dot(graph, "graph.dot")
    pgv_graph = pgv.AGraph("graph.dot")
    pgv_graph.layout(prog="fdp")
    pgv_graph.draw("graph.png")

    # nx.draw(graph, with_labels=True)
    # plt.show()
    
    # plot(princdf, titles)
    # plt.show()