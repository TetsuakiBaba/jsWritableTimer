/**
 * The $1 Unistroke Recognizer (JavaScript version)
 *
 *  Jacob O. Wobbrock, Ph.D.
 *  The Information School
 *  University of Washington
 *  Seattle, WA 98195-2840
 *  wobbrock@uw.edu
 *
 *  Andrew D. Wilson, Ph.D.
 *  Microsoft Research
 *  One Microsoft Way
 *  Redmond, WA 98052
 *  awilson@microsoft.com
 *
 *  Yang Li, Ph.D.
 *  Department of Computer Science and Engineering
 *  University of Washington
 *  Seattle, WA 98195-2840
 *  yangli@cs.washington.edu
 *
 * The academic publication for the $1 recognizer, and what should be
 * used to cite it, is:
 *
 *     Wobbrock, J.O., Wilson, A.D. and Li, Y. (2007). Gestures without
 *     libraries, toolkits or training: A $1 recognizer for user interface
 *     prototypes. Proceedings of the ACM Symposium on User Interface
 *     Software and Technology (UIST '07). Newport, Rhode Island (October
 *     7-10, 2007). New York: ACM Press, pp. 159-168.
 *     https://dl.acm.org/citation.cfm?id=1294238
 *
 * The Protractor enhancement was separately published by Yang Li and programmed
 * here by Jacob O. Wobbrock:
 *
 *     Li, Y. (2010). Protractor: A fast and accurate gesture
 *     recognizer. Proceedings of the ACM Conference on Human
 *     Factors in Computing Systems (CHI '10). Atlanta, Georgia
 *     (April 10-15, 2010). New York: ACM Press, pp. 2169-2172.
 *     https://dl.acm.org/citation.cfm?id=1753654
 *
 * This software is distributed under the "New BSD License" agreement:
 *
 * Copyright (C) 2007-2012, Jacob O. Wobbrock, Andrew D. Wilson and Yang Li.
 * All rights reserved. Last updated July 14, 2018.
 *
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions are met:
 *    * Redistributions of source code must retain the above copyright
 *      notice, this list of conditions and the following disclaimer.
 *    * Redistributions in binary form must reproduce the above copyright
 *      notice, this list of conditions and the following disclaimer in the
 *      documentation and/or other materials provided with the distribution.
 *    * Neither the names of the University of Washington nor Microsoft,
 *      nor the names of its contributors may be used to endorse or promote
 *      products derived from this software without specific prior written
 *      permission.
 *
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS
 * IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO,
 * THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR
 * PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL Jacob O. Wobbrock OR Andrew D. Wilson
 * OR Yang Li BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY,
 * OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF
 * SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS
 * INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT,
 * STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY
 * OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
**/
//
// Point class
//
function Point(x, y) // constructor
{
	this.X = x;
	this.Y = y;
}
//
// Rectangle class
//
function Rectangle(x, y, width, height) // constructor
{
	this.X = x;
	this.Y = y;
	this.Width = width;
	this.Height = height;
}
//
// Unistroke class: a unistroke template
//
function Unistroke(name, points) // constructor
{
	this.Name = name;
	this.Points = Resample(points, NumPoints);
	var radians = IndicativeAngle(this.Points);
	this.Points = RotateBy(this.Points, -radians);
	this.Points = ScaleTo(this.Points, SquareSize);
	this.Points = TranslateTo(this.Points, Origin);
	this.Vector = Vectorize(this.Points); // for Protractor
}
//
// Result class
//
function Result(name, score, ms) // constructor
{
	this.Name = name;
	this.Score = score;
	this.Time = ms;
}
//
// DollarRecognizer constants
//
const NumUnistrokes = 26;
const NumPoints = 64;
const SquareSize = 250.0;
const Origin = new Point(0, 0);
const Diagonal = Math.sqrt(SquareSize * SquareSize + SquareSize * SquareSize);
const HalfDiagonal = 0.5 * Diagonal;
const AngleRange = Deg2Rad(45.0);
const AnglePrecision = Deg2Rad(2.0);
const Phi = 0.5 * (-1.0 + Math.sqrt(5.0)); // Golden Ratio
//
// DollarRecognizer class
//
function DollarRecognizer() // constructor
{
	//
	// one built-in unistroke per gesture type
	//
	this.Unistrokes = new Array(NumUnistrokes);
	this.Unistrokes[0] = new Unistroke("0", new Array(new Point(752, 171), new Point(752, 171), new Point(752, 171), new Point(752, 171), new Point(752, 171), new Point(752, 170), new Point(749, 169), new Point(746, 167), new Point(742, 166), new Point(740, 165), new Point(734, 163), new Point(731, 162), new Point(726, 161), new Point(720, 160), new Point(715, 159), new Point(710, 159), new Point(705, 159), new Point(699, 159), new Point(692, 159), new Point(686, 160), new Point(680, 161), new Point(675, 162), new Point(670, 165), new Point(665, 168), new Point(660, 173), new Point(653, 178), new Point(647, 183), new Point(643, 188), new Point(637, 195), new Point(633, 201), new Point(630, 207), new Point(628, 210), new Point(625, 217), new Point(623, 221), new Point(622, 224), new Point(620, 230), new Point(618, 234), new Point(617, 240), new Point(615, 246), new Point(614, 252), new Point(613, 260), new Point(613, 267), new Point(612, 277), new Point(612, 283), new Point(612, 290), new Point(612, 301), new Point(612, 309), new Point(613, 320), new Point(614, 330), new Point(615, 339), new Point(616, 349), new Point(618, 361), new Point(620, 373), new Point(623, 382), new Point(626, 394), new Point(629, 403), new Point(632, 412), new Point(635, 416), new Point(640, 423), new Point(647, 429), new Point(653, 433), new Point(663, 435), new Point(676, 437), new Point(692, 439), new Point(705, 441), new Point(714, 441), new Point(722, 440), new Point(731, 436), new Point(738, 431), new Point(744, 425), new Point(748, 419), new Point(751, 412), new Point(756, 399), new Point(760, 388), new Point(764, 375), new Point(768, 359), new Point(770, 346), new Point(772, 335), new Point(774, 321), new Point(775, 308), new Point(775, 296), new Point(775, 284), new Point(774, 272), new Point(773, 260), new Point(771, 249), new Point(769, 238), new Point(766, 227), new Point(763, 215), new Point(759, 202), new Point(755, 190), new Point(751, 179), new Point(746, 169), new Point(744, 163), new Point(741, 157), new Point(739, 154), new Point(738, 153), new Point(737, 152)));
	this.Unistrokes[1] = new Unistroke("1", new Array(new Point(145, 97), new Point(145, 97), new Point(145, 97), new Point(145, 97), new Point(145, 97), new Point(145, 97), new Point(145, 106), new Point(145, 121), new Point(145, 174), new Point(145, 250), new Point(144, 294), new Point(143, 325), new Point(141, 351), new Point(140, 366), new Point(139, 379), new Point(139, 389), new Point(138, 399), new Point(137, 412), new Point(136, 428), new Point(134, 444), new Point(134, 456), new Point(133, 470), new Point(132, 482), new Point(131, 492), new Point(130, 499), new Point(130, 501), new Point(130, 502), new Point(130, 502)));
	this.Unistrokes[2] = new Unistroke("2", new Array(new Point(592, 232), new Point(592, 232), new Point(592, 232), new Point(592, 232), new Point(592, 231), new Point(591, 226), new Point(591, 219), new Point(591, 209), new Point(592, 202), new Point(595, 196), new Point(598, 191), new Point(602, 187), new Point(608, 184), new Point(615, 181), new Point(623, 179), new Point(634, 177), new Point(643, 176), new Point(655, 176), new Point(666, 177), new Point(677, 181), new Point(688, 185), new Point(697, 191), new Point(704, 198), new Point(708, 201), new Point(715, 213), new Point(719, 223), new Point(719, 224), new Point(724, 237), new Point(727, 248), new Point(728, 258), new Point(728, 268), new Point(722, 280), new Point(713, 291), new Point(701, 304), new Point(689, 316), new Point(677, 327), new Point(669, 334), new Point(654, 346), new Point(641, 356), new Point(629, 366), new Point(618, 376), new Point(608, 385), new Point(599, 394), new Point(593, 401), new Point(588, 406), new Point(587, 409), new Point(587, 412), new Point(590, 415), new Point(595, 418), new Point(602, 422), new Point(614, 424), new Point(633, 426), new Point(655, 427), new Point(672, 427), new Point(701, 428), new Point(714, 428), new Point(729, 424), new Point(743, 421), new Point(752, 418), new Point(762, 416), new Point(767, 415), new Point(770, 415), new Point(772, 415), new Point(773, 415), new Point(773, 414), new Point(773, 414)));
	this.Unistrokes[3] = new Unistroke("3", new Array(new Point(611, 187), new Point(611, 187), new Point(611, 187), new Point(611, 187), new Point(611, 186), new Point(612, 184), new Point(619, 178), new Point(628, 172), new Point(641, 166), new Point(655, 162), new Point(667, 160), new Point(681, 160), new Point(694, 160), new Point(704, 163), new Point(713, 169), new Point(718, 174), new Point(725, 182), new Point(731, 189), new Point(735, 196), new Point(739, 205), new Point(742, 212), new Point(743, 219), new Point(744, 227), new Point(743, 236), new Point(735, 247), new Point(725, 258), new Point(714, 267), new Point(704, 272), new Point(692, 277), new Point(681, 279), new Point(672, 280), new Point(665, 281), new Point(661, 282), new Point(658, 282), new Point(657, 282), new Point(656, 283), new Point(655, 283), new Point(654, 283), new Point(654, 284), new Point(654, 284), new Point(655, 284), new Point(664, 285), new Point(680, 286), new Point(697, 290), new Point(709, 294), new Point(722, 301), new Point(732, 309), new Point(740, 317), new Point(746, 323), new Point(752, 332), new Point(756, 341), new Point(758, 348), new Point(759, 353), new Point(760, 360), new Point(759, 368), new Point(754, 375), new Point(749, 383), new Point(735, 398), new Point(729, 403), new Point(718, 412), new Point(710, 417), new Point(699, 423), new Point(692, 426), new Point(680, 429), new Point(667, 431), new Point(659, 431), new Point(645, 431), new Point(636, 431), new Point(628, 429), new Point(623, 426), new Point(619, 424), new Point(617, 423), new Point(616, 422), new Point(615, 422), new Point(615, 422), new Point(615, 421), new Point(615, 421), new Point(615, 421)));
	this.Unistrokes[4] = new Unistroke("4", new Array(new Point(690, 159), new Point(691, 159), new Point(691, 159), new Point(691, 159), new Point(690, 159), new Point(684, 162), new Point(673, 169), new Point(661, 181), new Point(650, 193), new Point(642, 205), new Point(637, 215), new Point(632, 226), new Point(627, 236), new Point(621, 249), new Point(614, 264), new Point(606, 281), new Point(599, 296), new Point(597, 303), new Point(594, 313), new Point(594, 316), new Point(595, 318), new Point(598, 320), new Point(615, 326), new Point(634, 330), new Point(648, 332), new Point(663, 334), new Point(679, 335), new Point(701, 335), new Point(709, 335), new Point(721, 334), new Point(732, 333), new Point(737, 332), new Point(743, 330), new Point(749, 328), new Point(754, 324), new Point(758, 319), new Point(760, 313), new Point(761, 302), new Point(761, 291), new Point(757, 280), new Point(751, 270), new Point(744, 262), new Point(735, 256), new Point(723, 251), new Point(715, 249), new Point(707, 249), new Point(700, 249), new Point(695, 252), new Point(691, 254), new Point(688, 255), new Point(687, 257), new Point(687, 257), new Point(687, 264), new Point(687, 278), new Point(687, 295), new Point(689, 320), new Point(691, 346), new Point(692, 376), new Point(692, 399), new Point(691, 416), new Point(690, 429), new Point(689, 438), new Point(688, 444), new Point(688, 447), new Point(688, 448), new Point(688, 449), new Point(688, 449), new Point(688, 450), new Point(688, 451), new Point(688, 453), new Point(688, 454), new Point(688, 455), new Point(688, 455)));
	this.Unistrokes[5] = new Unistroke("5", new Array(new Point(738, 189), new Point(738, 189), new Point(738, 189), new Point(738, 189), new Point(738, 189), new Point(738, 188), new Point(738, 185), new Point(737, 181), new Point(733, 177), new Point(724, 171), new Point(711, 167), new Point(698, 165), new Point(682, 164), new Point(661, 167), new Point(641, 175), new Point(624, 184), new Point(612, 199), new Point(604, 214), new Point(601, 227), new Point(601, 240), new Point(604, 253), new Point(615, 267), new Point(637, 282), new Point(660, 292), new Point(686, 300), new Point(713, 306), new Point(734, 311), new Point(745, 314), new Point(755, 321), new Point(762, 327), new Point(766, 335), new Point(768, 344), new Point(768, 352), new Point(762, 365), new Point(755, 375), new Point(749, 386), new Point(740, 396), new Point(729, 405), new Point(709, 411), new Point(659, 412), new Point(623, 412), new Point(602, 412), new Point(593, 411), new Point(592, 411), new Point(592, 411)));
	this.Unistrokes[6] = new Unistroke("6", new Array(new Point(738, 205), new Point(739, 205), new Point(739, 205), new Point(739, 205), new Point(739, 205), new Point(739, 203), new Point(738, 198), new Point(736, 193), new Point(732, 184), new Point(727, 178), new Point(723, 175), new Point(713, 170), new Point(702, 169), new Point(689, 169), new Point(676, 172), new Point(665, 177), new Point(656, 183), new Point(647, 190), new Point(640, 198), new Point(633, 206), new Point(627, 217), new Point(622, 229), new Point(617, 242), new Point(612, 256), new Point(607, 274), new Point(605, 291), new Point(605, 308), new Point(605, 325), new Point(606, 341), new Point(609, 356), new Point(613, 372), new Point(618, 385), new Point(624, 400), new Point(635, 412), new Point(649, 422), new Point(660, 426), new Point(674, 429), new Point(686, 430), new Point(697, 430), new Point(704, 428), new Point(712, 423), new Point(724, 410), new Point(730, 398), new Point(735, 384), new Point(739, 369), new Point(740, 357), new Point(742, 344), new Point(742, 336), new Point(741, 330), new Point(737, 324), new Point(730, 319), new Point(723, 316), new Point(710, 311), new Point(693, 308), new Point(681, 307), new Point(661, 307), new Point(648, 307), new Point(636, 309), new Point(634, 310), new Point(621, 316), new Point(617, 319), new Point(615, 320), new Point(615, 320), new Point(615, 320), new Point(615, 321)));
	this.Unistrokes[7] = new Unistroke("7", new Array(new Point(613, 183), new Point(613, 182), new Point(613, 182), new Point(613, 182), new Point(613, 182), new Point(613, 182), new Point(613, 182), new Point(620, 182), new Point(634, 182), new Point(652, 182), new Point(668, 182), new Point(681, 182), new Point(690, 182), new Point(700, 183), new Point(706, 183), new Point(714, 184), new Point(722, 184), new Point(731, 186), new Point(740, 187), new Point(748, 187), new Point(753, 187), new Point(755, 187), new Point(755, 188), new Point(755, 188), new Point(756, 188), new Point(758, 189), new Point(760, 189), new Point(760, 191), new Point(755, 197), new Point(738, 218), new Point(726, 238), new Point(722, 251), new Point(715, 274), new Point(714, 281), new Point(710, 295), new Point(707, 310), new Point(703, 327), new Point(699, 345), new Point(695, 363), new Point(693, 377), new Point(691, 387), new Point(689, 396), new Point(689, 402), new Point(688, 408), new Point(687, 418), new Point(686, 427), new Point(685, 434), new Point(684, 437), new Point(684, 439), new Point(684, 440), new Point(684, 443), new Point(683, 446), new Point(682, 451), new Point(681, 455), new Point(681, 456), new Point(681, 457), new Point(680, 457)));
	this.Unistrokes[8] = new Unistroke("8", new Array(new Point(759, 266), new Point(759, 267), new Point(759, 267), new Point(759, 267), new Point(759, 263), new Point(759, 254), new Point(759, 244), new Point(759, 232), new Point(758, 226), new Point(753, 212), new Point(748, 202), new Point(741, 194), new Point(734, 188), new Point(727, 184), new Point(722, 180), new Point(714, 178), new Point(708, 177), new Point(702, 176), new Point(695, 176), new Point(688, 177), new Point(683, 179), new Point(675, 184), new Point(666, 191), new Point(659, 198), new Point(649, 210), new Point(645, 216), new Point(639, 227), new Point(634, 238), new Point(630, 251), new Point(629, 260), new Point(629, 271), new Point(634, 279), new Point(643, 288), new Point(657, 298), new Point(673, 307), new Point(690, 317), new Point(706, 328), new Point(718, 337), new Point(727, 345), new Point(732, 354), new Point(737, 362), new Point(742, 372), new Point(748, 383), new Point(753, 394), new Point(755, 401), new Point(756, 406), new Point(754, 412), new Point(745, 421), new Point(738, 427), new Point(731, 432), new Point(721, 436), new Point(712, 436), new Point(704, 433), new Point(694, 428), new Point(685, 423), new Point(679, 420), new Point(673, 417), new Point(668, 414), new Point(664, 411), new Point(661, 405), new Point(660, 398), new Point(658, 390), new Point(658, 380), new Point(658, 367), new Point(660, 357), new Point(665, 349), new Point(672, 338), new Point(682, 328), new Point(694, 316), new Point(707, 305), new Point(718, 295), new Point(728, 287), new Point(736, 279), new Point(742, 270), new Point(746, 263), new Point(748, 257), new Point(750, 252), new Point(751, 248), new Point(752, 246), new Point(752, 246)));
	this.Unistrokes[9] = new Unistroke("9", new Array(new Point(762, 257), new Point(762, 257), new Point(762, 257), new Point(762, 257), new Point(762, 257), new Point(762, 251), new Point(762, 243), new Point(763, 236), new Point(763, 221), new Point(763, 209), new Point(760, 200), new Point(757, 193), new Point(752, 183), new Point(747, 177), new Point(739, 170), new Point(733, 166), new Point(726, 162), new Point(716, 158), new Point(708, 156), new Point(698, 156), new Point(687, 156), new Point(677, 157), new Point(667, 161), new Point(656, 167), new Point(646, 174), new Point(636, 183), new Point(627, 192), new Point(619, 202), new Point(612, 214), new Point(606, 227), new Point(603, 240), new Point(601, 254), new Point(601, 267), new Point(601, 275), new Point(608, 287), new Point(615, 296), new Point(624, 304), new Point(631, 308), new Point(641, 313), new Point(654, 316), new Point(667, 317), new Point(680, 317), new Point(693, 315), new Point(701, 314), new Point(708, 311), new Point(715, 308), new Point(715, 308), new Point(729, 299), new Point(741, 291), new Point(744, 288), new Point(748, 286), new Point(751, 284), new Point(752, 284), new Point(753, 283), new Point(754, 282), new Point(755, 281), new Point(756, 280), new Point(756, 280), new Point(756, 280), new Point(756, 280), new Point(756, 281), new Point(755, 283), new Point(753, 289), new Point(752, 296), new Point(750, 300), new Point(747, 310), new Point(745, 320), new Point(744, 324), new Point(740, 337), new Point(738, 347), new Point(735, 361), new Point(732, 377), new Point(728, 392), new Point(725, 409), new Point(721, 425), new Point(718, 439), new Point(715, 450), new Point(714, 457), new Point(713, 461), new Point(712, 463), new Point(712, 464), new Point(712, 464), new Point(712, 465), new Point(712, 466), new Point(712, 466), new Point(712, 466), new Point(712, 466)));
	this.Unistrokes[10] = new Unistroke("1", new Array(new Point(140, 147), new Point(140, 147), new Point(140, 147), new Point(140, 147), new Point(140, 147), new Point(140, 147), new Point(140, 148), new Point(140, 155), new Point(140, 168), new Point(140, 183), new Point(140, 200), new Point(139, 215), new Point(139, 224), new Point(138, 236), new Point(138, 249), new Point(137, 267), new Point(137, 276), new Point(136, 291), new Point(136, 310), new Point(135, 328), new Point(135, 343), new Point(134, 359), new Point(133, 376), new Point(133, 392), new Point(133, 403), new Point(133, 417), new Point(133, 427), new Point(134, 439), new Point(135, 447), new Point(135, 454), new Point(135, 457), new Point(136, 457), new Point(136, 458), new Point(136, 458), new Point(136, 458), new Point(136, 455)));
	this.Unistrokes[11] = new Unistroke("1", new Array(new Point(181, 182), new Point(181, 181), new Point(181, 181), new Point(181, 181), new Point(181, 181), new Point(181, 186), new Point(181, 200), new Point(180, 230), new Point(179, 268), new Point(178, 327), new Point(178, 345), new Point(178, 367), new Point(177, 402), new Point(176, 424), new Point(175, 442), new Point(174, 461), new Point(174, 472), new Point(174, 477)));
	this.Unistrokes[12] = new Unistroke("9", new Array(new Point(465, 271), new Point(465, 271), new Point(465, 271), new Point(465, 267), new Point(465, 247), new Point(449, 209), new Point(416, 194), new Point(382, 192), new Point(360, 202), new Point(354, 226), new Point(375, 255), new Point(403, 268), new Point(424, 273), new Point(435, 275), new Point(441, 279), new Point(443, 298), new Point(435, 351), new Point(399, 426), new Point(379, 466), new Point(371, 482), new Point(362, 500)));
	this.Unistrokes[13] = new Unistroke("0", new Array(new Point(707, 362), new Point(707, 362), new Point(707, 362), new Point(704, 362), new Point(690, 362), new Point(662, 354), new Point(632, 329), new Point(618, 266), new Point(625, 234), new Point(647, 198), new Point(669, 189), new Point(704, 205), new Point(727, 230), new Point(748, 271), new Point(741, 314), new Point(712, 347), new Point(685, 367), new Point(671, 375), new Point(664, 378)));
	this.Unistrokes[14] = new Unistroke("7", new Array(new Point(624, 226), new Point(623, 226), new Point(623, 226), new Point(624, 226), new Point(653, 226), new Point(706, 228), new Point(738, 238), new Point(756, 251), new Point(761, 265), new Point(761, 281), new Point(749, 304), new Point(722, 338), new Point(704, 363), new Point(693, 378), new Point(674, 411), new Point(664, 432), new Point(660, 440), new Point(660, 442), new Point(660, 443)));
	this.Unistrokes[15] = new Unistroke("6", new Array(new Point(429, 254), new Point(429, 254), new Point(429, 254), new Point(415, 267), new Point(386, 302), new Point(368, 348), new Point(368, 388), new Point(384, 402), new Point(403, 404), new Point(408, 394), new Point(395, 378), new Point(383, 374)));
	this.Unistrokes[16] = new Unistroke("1", new Array(new Point(648, 199), new Point(649, 199), new Point(649, 200), new Point(649, 203), new Point(649, 208), new Point(649, 224), new Point(649, 239), new Point(649, 259), new Point(649, 280), new Point(649, 292), new Point(647, 314), new Point(646, 336), new Point(646, 354), new Point(645, 371), new Point(645, 377), new Point(645, 381), new Point(645, 389)));
	this.Unistrokes[17] = new Unistroke("5", new Array(new Point(360, 226), new Point(360, 226), new Point(360, 228), new Point(360, 232), new Point(360, 237), new Point(360, 245), new Point(360, 254), new Point(360, 265), new Point(360, 277), new Point(362, 289), new Point(364, 300), new Point(368, 311), new Point(372, 321), new Point(384, 339), new Point(391, 344), new Point(395, 348), new Point(404, 355), new Point(413, 361), new Point(425, 369), new Point(430, 373), new Point(433, 377), new Point(435, 380), new Point(437, 384), new Point(437, 388), new Point(438, 392), new Point(438, 397), new Point(438, 401), new Point(438, 403), new Point(435, 410), new Point(433, 413), new Point(428, 419), new Point(423, 423), new Point(417, 427), new Point(409, 429), new Point(400, 432), new Point(395, 432), new Point(379, 434), new Point(369, 434), new Point(363, 434), new Point(348, 429), new Point(340, 423), new Point(333, 415), new Point(326, 405), new Point(321, 391), new Point(319, 376), new Point(318, 359), new Point(318, 344), new Point(318, 328), new Point(320, 322), new Point(323, 311), new Point(328, 302), new Point(332, 294), new Point(341, 282), new Point(349, 278), new Point(358, 274), new Point(377, 269), new Point(384, 269), new Point(397, 269), new Point(411, 269), new Point(416, 271), new Point(420, 272), new Point(427, 274), new Point(432, 276), new Point(435, 277), new Point(437, 278), new Point(438, 278), new Point(439, 279), new Point(439, 279), new Point(439, 279), new Point(440, 279)));
	this.Unistrokes[18] = new Unistroke("8", new Array(new Point(418, 293), new Point(417, 293), new Point(415, 292), new Point(410, 289), new Point(404, 287), new Point(401, 287), new Point(394, 286), new Point(387, 286), new Point(383, 286), new Point(379, 286), new Point(378, 288), new Point(375, 294), new Point(375, 299), new Point(378, 312), new Point(386, 325), new Point(395, 342), new Point(400, 350), new Point(403, 358), new Point(414, 381), new Point(416, 394), new Point(416, 405), new Point(415, 414), new Point(409, 423), new Point(401, 429), new Point(392, 435), new Point(388, 436), new Point(385, 437), new Point(382, 438), new Point(377, 438), new Point(375, 437), new Point(377, 431), new Point(388, 419), new Point(418, 394), new Point(435, 385), new Point(448, 378), new Point(456, 374), new Point(462, 371), new Point(471, 366), new Point(478, 362), new Point(482, 360), new Point(485, 359), new Point(486, 358), new Point(486, 358), new Point(487, 358)));
	this.Unistrokes[19] = new Unistroke("1", new Array(new Point(407, 239), new Point(407, 238), new Point(407, 240), new Point(407, 245), new Point(405, 259), new Point(403, 274), new Point(401, 291), new Point(398, 314), new Point(397, 326), new Point(395, 348), new Point(392, 368), new Point(392, 375)));
	this.Unistrokes[20] = new Unistroke("1", new Array(new Point(187, 240), new Point(186, 238), new Point(186, 238), new Point(185, 239), new Point(183, 242), new Point(180, 247), new Point(175, 259), new Point(170, 274), new Point(165, 293), new Point(159, 316), new Point(154, 341), new Point(153, 352), new Point(152, 361), new Point(149, 377), new Point(149, 382), new Point(148, 391), new Point(148, 397)));
	this.Unistrokes[21] = new Unistroke("1", new Array(new Point(378, 229), new Point(379, 228), new Point(379, 228), new Point(379, 229), new Point(379, 234), new Point(379, 241), new Point(379, 256), new Point(379, 273), new Point(379, 296), new Point(379, 323), new Point(379, 351), new Point(379, 363), new Point(379, 373), new Point(379, 392), new Point(379, 397), new Point(379, 408), new Point(379, 415), new Point(379, 420), new Point(379, 422)));
	this.Unistrokes[22] = new Unistroke("1", new Array(new Point(178, 187), new Point(177, 186), new Point(177, 187), new Point(177, 191), new Point(176, 197), new Point(174, 206), new Point(170, 223), new Point(167, 240), new Point(163, 262), new Point(160, 285), new Point(158, 298), new Point(155, 320), new Point(151, 340), new Point(147, 359), new Point(146, 366), new Point(144, 370), new Point(144, 379), new Point(141, 386)));
	this.Unistrokes[23] = new Unistroke("1", new Array(new Point(167, 214), new Point(167, 213), new Point(167, 215), new Point(167, 217), new Point(167, 223), new Point(167, 230), new Point(167, 247), new Point(167, 263), new Point(166, 283), new Point(165, 306), new Point(164, 319), new Point(163, 343), new Point(162, 364), new Point(162, 373), new Point(161, 386), new Point(161, 391), new Point(160, 405), new Point(160, 408), new Point(160, 411), new Point(160, 411)));
	this.Unistrokes[24] = new Unistroke("5", new Array(new Point(548, 266), new Point(548, 266), new Point(545, 266), new Point(540, 265), new Point(527, 265), new Point(514, 265), new Point(494, 265), new Point(475, 270), new Point(465, 274), new Point(447, 283), new Point(431, 294), new Point(427, 299), new Point(417, 309), new Point(412, 317), new Point(409, 326), new Point(408, 340), new Point(408, 349), new Point(417, 364), new Point(428, 374), new Point(445, 384), new Point(454, 389), new Point(470, 398), new Point(486, 407), new Point(501, 416), new Point(507, 420), new Point(518, 427), new Point(526, 433), new Point(528, 435), new Point(533, 439), new Point(540, 446), new Point(541, 447), new Point(543, 449), new Point(546, 454), new Point(546, 457), new Point(547, 460), new Point(548, 461), new Point(548, 466), new Point(548, 469), new Point(547, 472), new Point(545, 476), new Point(540, 481), new Point(535, 485), new Point(528, 490), new Point(518, 496), new Point(507, 502), new Point(494, 508), new Point(479, 514), new Point(466, 518), new Point(460, 520), new Point(450, 522), new Point(443, 522), new Point(435, 522), new Point(432, 522), new Point(430, 522), new Point(428, 522), new Point(428, 521), new Point(427, 521), new Point(427, 521), new Point(427, 520), new Point(427, 520)));
	this.Unistrokes[25] = new Unistroke("c", new Array(new Point(695, 323), new Point(695, 323), new Point(695, 321), new Point(695, 319), new Point(694, 317), new Point(694, 313), new Point(692, 309), new Point(687, 303), new Point(681, 298), new Point(658, 289), new Point(643, 288), new Point(628, 288), new Point(606, 289), new Point(587, 297), new Point(569, 307), new Point(559, 315), new Point(543, 327), new Point(528, 341), new Point(516, 354), new Point(506, 368), new Point(498, 382), new Point(493, 396), new Point(489, 410), new Point(488, 423), new Point(488, 436), new Point(488, 450), new Point(490, 460), new Point(496, 473), new Point(505, 483), new Point(515, 493), new Point(527, 502), new Point(552, 514), new Point(570, 517), new Point(592, 518), new Point(617, 518), new Point(629, 518), new Point(649, 514), new Point(666, 509), new Point(672, 507), new Point(677, 505), new Point(686, 502), new Point(692, 500), new Point(695, 498), new Point(697, 497), new Point(699, 497), new Point(700, 496), new Point(700, 496), new Point(700, 496), new Point(700, 495), new Point(700, 495)));
	this.Unistrokes[26] = new Unistroke("1", new Array(new Point(296, 182), new Point(296, 183), new Point(296, 185), new Point(296, 189), new Point(296, 193), new Point(296, 203), new Point(296, 211), new Point(296, 222), new Point(296, 235), new Point(296, 249), new Point(296, 264), new Point(296, 278), new Point(296, 284), new Point(296, 296), new Point(296, 307), new Point(296, 310), new Point(296, 317), new Point(296, 322), new Point(296, 326), new Point(296, 330), new Point(296, 332), new Point(296, 334), new Point(296, 335), new Point(296, 336)));

	//
	// The $1 Gesture Recognizer API begins here -- 3 methods: Recognize(), AddGesture(), and DeleteUserGestures()
	//
	this.Recognize = function (points, useProtractor) {
		var t0 = Date.now();
		var candidate = new Unistroke("", points);

		var u = -1;
		var b = +Infinity;
		for (var i = 0; i < this.Unistrokes.length; i++) // for each unistroke template
		{
			var d;
			if (useProtractor)
				d = OptimalCosineDistance(this.Unistrokes[i].Vector, candidate.Vector); // Protractor
			else
				d = DistanceAtBestAngle(candidate.Points, this.Unistrokes[i], -AngleRange, +AngleRange, AnglePrecision); // Golden Section Search (original $1)
			if (d < b) {
				b = d; // best (least) distance
				u = i; // unistroke index
			}
		}
		var t1 = Date.now();
		return (u == -1) ? new Result("No match.", 0.0, t1 - t0) : new Result(this.Unistrokes[u].Name, useProtractor ? (1.0 - b) : (1.0 - b / HalfDiagonal), t1 - t0);
	}
	this.AddGesture = function (name, points) {
		this.Unistrokes[this.Unistrokes.length] = new Unistroke(name, points); // append new unistroke
		var num = 0;
		for (var i = 0; i < this.Unistrokes.length; i++) {
			if (this.Unistrokes[i].Name == name)
				num++;
		}
		return num;
	}
	this.DeleteUserGestures = function () {
		this.Unistrokes.length = NumUnistrokes; // clear any beyond the original set
		return NumUnistrokes;
	}
}
//
// Private helper functions from here on down
//
function Resample(points, n) {
	var I = PathLength(points) / (n - 1); // interval length
	var D = 0.0;
	var newpoints = new Array(points[0]);
	for (var i = 1; i < points.length; i++) {
		var d = Distance(points[i - 1], points[i]);
		if ((D + d) >= I) {
			var qx = points[i - 1].X + ((I - D) / d) * (points[i].X - points[i - 1].X);
			var qy = points[i - 1].Y + ((I - D) / d) * (points[i].Y - points[i - 1].Y);
			var q = new Point(qx, qy);
			newpoints[newpoints.length] = q; // append new point 'q'
			points.splice(i, 0, q); // insert 'q' at position i in points s.t. 'q' will be the next i
			D = 0.0;
		}
		else D += d;
	}
	if (newpoints.length == n - 1) // somtimes we fall a rounding-error short of adding the last point, so add it if so
		newpoints[newpoints.length] = new Point(points[points.length - 1].X, points[points.length - 1].Y);
	return newpoints;
}
function IndicativeAngle(points) {
	var c = Centroid(points);
	return Math.atan2(c.Y - points[0].Y, c.X - points[0].X);
}
function RotateBy(points, radians) // rotates points around centroid
{
	var c = Centroid(points);
	var cos = Math.cos(radians);
	var sin = Math.sin(radians);
	var newpoints = new Array();
	for (var i = 0; i < points.length; i++) {
		var qx = (points[i].X - c.X) * cos - (points[i].Y - c.Y) * sin + c.X
		var qy = (points[i].X - c.X) * sin + (points[i].Y - c.Y) * cos + c.Y;
		newpoints[newpoints.length] = new Point(qx, qy);
	}
	return newpoints;
}
function ScaleTo(points, size) // non-uniform scale; assumes 2D gestures (i.e., no lines)
{
	var B = BoundingBox(points);
	var newpoints = new Array();
	for (var i = 0; i < points.length; i++) {
		var qx = points[i].X * (size / B.Width);
		var qy = points[i].Y * (size / B.Height);
		newpoints[newpoints.length] = new Point(qx, qy);
	}
	return newpoints;
}
function TranslateTo(points, pt) // translates points' centroid
{
	var c = Centroid(points);
	var newpoints = new Array();
	for (var i = 0; i < points.length; i++) {
		var qx = points[i].X + pt.X - c.X;
		var qy = points[i].Y + pt.Y - c.Y;
		newpoints[newpoints.length] = new Point(qx, qy);
	}
	return newpoints;
}
function Vectorize(points) // for Protractor
{
	var sum = 0.0;
	var vector = new Array();
	for (var i = 0; i < points.length; i++) {
		vector[vector.length] = points[i].X;
		vector[vector.length] = points[i].Y;
		sum += points[i].X * points[i].X + points[i].Y * points[i].Y;
	}
	var magnitude = Math.sqrt(sum);
	for (var i = 0; i < vector.length; i++)
		vector[i] /= magnitude;
	return vector;
}
function OptimalCosineDistance(v1, v2) // for Protractor
{
	var a = 0.0;
	var b = 0.0;
	for (var i = 0; i < v1.length; i += 2) {
		a += v1[i] * v2[i] + v1[i + 1] * v2[i + 1];
		b += v1[i] * v2[i + 1] - v1[i + 1] * v2[i];
	}
	var angle = Math.atan(b / a);
	return Math.acos(a * Math.cos(angle) + b * Math.sin(angle));
}
function DistanceAtBestAngle(points, T, a, b, threshold) {
	var x1 = Phi * a + (1.0 - Phi) * b;
	var f1 = DistanceAtAngle(points, T, x1);
	var x2 = (1.0 - Phi) * a + Phi * b;
	var f2 = DistanceAtAngle(points, T, x2);
	while (Math.abs(b - a) > threshold) {
		if (f1 < f2) {
			b = x2;
			x2 = x1;
			f2 = f1;
			x1 = Phi * a + (1.0 - Phi) * b;
			f1 = DistanceAtAngle(points, T, x1);
		} else {
			a = x1;
			x1 = x2;
			f1 = f2;
			x2 = (1.0 - Phi) * a + Phi * b;
			f2 = DistanceAtAngle(points, T, x2);
		}
	}
	return Math.min(f1, f2);
}
function DistanceAtAngle(points, T, radians) {
	var newpoints = RotateBy(points, radians);
	return PathDistance(newpoints, T.Points);
}
function Centroid(points) {
	var x = 0.0, y = 0.0;
	for (var i = 0; i < points.length; i++) {
		x += points[i].X;
		y += points[i].Y;
	}
	x /= points.length;
	y /= points.length;
	return new Point(x, y);
}
function BoundingBox(points) {
	var minX = +Infinity, maxX = -Infinity, minY = +Infinity, maxY = -Infinity;
	for (var i = 0; i < points.length; i++) {
		minX = Math.min(minX, points[i].X);
		minY = Math.min(minY, points[i].Y);
		maxX = Math.max(maxX, points[i].X);
		maxY = Math.max(maxY, points[i].Y);
	}
	return new Rectangle(minX, minY, maxX - minX, maxY - minY);
}
function PathDistance(pts1, pts2) {
	var d = 0.0;
	for (var i = 0; i < pts1.length; i++) // assumes pts1.length == pts2.length
		d += Distance(pts1[i], pts2[i]);
	return d / pts1.length;
}
function PathLength(points) {
	var d = 0.0;
	for (var i = 1; i < points.length; i++)
		d += Distance(points[i - 1], points[i]);
	return d;
}
function Distance(p1, p2) {
	var dx = p2.X - p1.X;
	var dy = p2.Y - p1.Y;
	return Math.sqrt(dx * dx + dy * dy);
}
function Deg2Rad(d) { return (d * Math.PI / 180.0); }