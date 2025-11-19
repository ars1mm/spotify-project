-- Insert sample trending albums
INSERT INTO trending_albums (album_name, artist_name, album_cover_url, rank_position, trend_score, release_date) VALUES
('Midnights', 'Taylor Swift', '/covers/midnights.jpg', 1, 95.5, '2022-10-21'),
('Harry''s House', 'Harry Styles', '/covers/harrys-house.jpg', 2, 92.3, '2022-05-20'),
('Un Verano Sin Ti', 'Bad Bunny', '/covers/verano.jpg', 3, 89.7, '2022-05-06'),
('Renaissance', 'Beyoncé', '/covers/renaissance.jpg', 4, 87.2, '2022-07-29'),
('Dawn FM', 'The Weeknd', '/covers/dawn-fm.jpg', 5, 84.8, '2022-01-07'),
('Honestly, Nevermind', 'Drake', '/covers/honestly.jpg', 6, 82.1, '2022-06-17'),
('Mr. Morale & The Big Steppers', 'Kendrick Lamar', '/covers/mr-morale.jpg', 7, 79.9, '2022-05-13'),
('Sour', 'Olivia Rodrigo', '/covers/sour.jpg', 8, 77.4, '2021-05-21'),
('Planet Her', 'Doja Cat', '/covers/planet-her.jpg', 9, 75.6, '2021-06-25'),
('Certified Lover Boy', 'Drake', '/covers/clb.jpg', 10, 73.2, '2021-09-03')
ON CONFLICT DO NOTHING;