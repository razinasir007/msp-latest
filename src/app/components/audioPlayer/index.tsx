import React, { useRef, useEffect, useState } from "react";
import { useHookstate } from "@hookstate/core";
import ReactHowler from "react-howler";
import {
  BiPlay,
  BiPause,
  BiVolumeLow,
  BiVolumeFull,
  BiSkipNext,
  BiSkipPrevious,
} from "react-icons/bi";

import {
  Box,
  Card,
  HStack,
  Slider,
  SliderTrack,
  SliderFilledTrack,
  SliderThumb,
  Image,
  Text,
  Tooltip,
  Popover,
  PopoverTrigger,
  PopoverContent,
  PopoverHeader,
  PopoverBody,
  PopoverFooter,
  PopoverArrow,
  PopoverCloseButton,
  Button,
  Portal,
  Stack,
} from "@chakra-ui/react";
const defaultThumbnail = require("../../../assets/defaultThumbnail.png");
import { RiPlayListFill } from "react-icons/ri";
import { useGlobalState } from "../../../state/store";

// const songs = [
//   "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
//   "http://commondatastorage.googleapis.com/codeskulptor-demos/DDR_assets/Sevish_-__nbsp_.mp3",
// ];

export function AudioPlayer(props: { isPresenting: boolean }) {
  const state = useGlobalState();
  const songList = state.getAudios();
  const ref: any = useRef();
  // const [songThumbnail, setSongThumbnail] = useState<any>(null);
  const [songThumbnails, setSongThumbnails] = useState<Record<string, string>>(
    {}
  );
  const [showVolumeTooltip, setShowVolumeTooltip] = useState(false);
  const [showPlayerTooltip, setShowPlayerTooltip] = useState(false);

  const playerState = useHookstate({
    songIndex: 0,
    playing: false,
    mute: false,
    volume: 30,
    progress: 0,
    songLength: 60,
    interval: NaN,
  });

  const playerIconSize = "2em";

  const isPlaying = playerState.playing.get();

  // start the player when the user is presenting
  useEffect(() => {
    if (!props.isPresenting) {
      //fade out effect
      const targetVolume = 0;
      const finalVolume = playerState.volume.get();
      let initialVolume = finalVolume;
      playerState.volume.set(initialVolume);
      const steps = 3;
      let currentStep = 0;
      const volumeStep = (initialVolume - targetVolume) / steps;
      const fadeInterval = setInterval(() => {
        if (currentStep < steps) {
          initialVolume = initialVolume - volumeStep;
          playerState.volume.set(initialVolume);
          currentStep++;
        } else {
          playerState.playing.set(props.isPresenting);
          playerState.volume.set(finalVolume);
          clearInterval(fadeInterval);
        }
      }, 1);
    } else {
      //fade in effect
      let initialVolume = 0;
      const targetVolume = playerState.volume.get();
      playerState.volume.set(initialVolume);
      playerState.playing.set(props.isPresenting);
      const steps = 5;
      let currentStep = 0;
      const volumeStep = (targetVolume - initialVolume) / steps;
      const fadeInterval = setInterval(() => {
        if (currentStep < steps) {
          initialVolume += volumeStep;
          playerState.volume.set(initialVolume);
          currentStep++;
        } else {
          clearInterval(fadeInterval);
        }
      }, 1);
    }

    //New Code Addition
    const interval = playerState.interval.get();
    if (!isPlaying && !isNaN(interval)) {
      clearInterval(interval);
      playerState.interval.set(NaN);
    }
  }, [props.isPresenting, playerState.songIndex]);

  useEffect(() => {
    const thumbnails: Record<string, string> = {};
    songList.forEach((song) => {
      if (song.thumbnail) {
        thumbnails[song.id] = song.thumbnail;
      } else {
        thumbnails[song.id] = defaultThumbnail;
      }
    });
    setSongThumbnails(thumbnails);
  }, []);

  const timeformat = () => {
    const minutes = Math.floor(playerState.progress.get() / 60);
    const seconds = playerState.progress.get() % 60;
    // format seconds
    const secondsformat =
      seconds > 9 ? seconds : seconds.toString().padStart(2, "0");
    return `${minutes}:${secondsformat}`;
  };

  const remainingTime = () => {
    const remainingMinutes = Math.floor(
      (playerState.songLength.get() - playerState.progress.get()) / 60
    );
    const remainingSeconds =
      (playerState.songLength.get() - playerState.progress.get()) % 60;
    // format seconds
    const secondsformat =
      remainingSeconds > 9
        ? remainingSeconds
        : remainingSeconds.toString().padStart(2, "0");
    return `-${remainingMinutes}:${secondsformat}`;
  };
  return (
    <>
      {songList.length > 0 ? (
        <>
          <ReactHowler
            ref={ref}
            src={songList[playerState.songIndex.get()].base64}
            playing={isPlaying}
            mute={playerState.mute.get()}
            preload={true}
            volume={playerState.volume.get() / 100}
            onLoad={() => {
              {
                // // Access the metadata of the loaded song
                // const metadata = ref.current._howler._durationMetadata;
                // // Check if the metadata includes a thumbnail
                // if (
                //   metadata &&
                //   metadata.picture &&
                //   metadata.picture.length > 0
                // ) {
                //   const thumbnail = metadata.picture[0];

                //   // Convert the thumbnail data to a base64 string
                //   const base64String = btoa(
                //     String.fromCharCode.apply(null, thumbnail.data)
                //   );

                //   // Set the song thumbnail state
                //   setSongThumbnail(
                //     `data:${thumbnail.format};base64,${base64String}`
                //   );

                // } else {
                //   // If no thumbnail is available, set a default icon
                //   setSongThumbnail(defaultThumbnail); // Replace `defaultThumbnail` with the default icon URL or base64 string
                // }
                playerState.songLength.set(Math.ceil(ref.current.duration()));
              }
            }}
            onPause={() => clearInterval(playerState.interval.get())}
            onStop={() => clearInterval(playerState.interval.get())}
            onEnd={() => {
              playerState.playing.set(false);
              clearInterval(playerState.interval.get());
              //New Code Addition
              const nextSongIndex =
                (playerState.songIndex.get() + 1) % songList.length;
              playerState.songIndex.set(nextSongIndex);
              playerState.progress.set(0);
              playerState.playing.set(true);
            }}
            onPlay={() => {
              playerState.playing.set(true);
              const interval = setInterval(() => {
                // only update progress if we are currenlty playing a song
                if (playerState.playing.get()) {
                  const progress = Math.round(ref.current?.seek());
                  playerState.progress.set(progress);
                } else {
                  clearInterval(interval);
                }
              }, 25);

              playerState.interval.set(Number(interval));
            }}
          />
          <Card minH='50' w='100%' borderRadius={0} bg={"#F8F8FF"}>
            <HStack spacing={2} width='100%' alignItems='center'>
              {/* <Image src={songList[playerState.songIndex.get()].thumbnail || defaultThumbnail} style={{ height: 50 }} /> */}
              <Image
                src={
                  songList[playerState.songIndex.get()].thumbnail
                    ? `data:image/jpeg;base64,${
                        songList[playerState.songIndex.get()].thumbnail
                      }`
                    : defaultThumbnail
                }
                style={{ height: 50, width: 50, objectFit: "cover" }}
              />
              <Box>
                <Text style={{ fontSize: 14, width: "140px" }}>
                  {songList[playerState.songIndex.get()].filename.substring(
                    0,
                    20
                  )}
                  {/* {songList[playerState.songIndex.get()].filename} */}
                </Text>
                {/* <Text style={{ fontSize: 14 }}>Song Name</Text> */}
                <Text style={{ fontSize: 12 }}>artist</Text>
              </Box>

              <HStack spacing={5} width='fit-content' alignItems='center'>
                <BiSkipPrevious
                  onClick={() => {
                    playerState.songIndex.set(
                      (prev) => Math.abs(prev - 1) % songList.length
                    );
                    playerState.progress.set(0);
                  }}
                  size={playerIconSize}
                />
                {isPlaying ? (
                  <BiPause
                    onClick={() => playerState.playing.set(!isPlaying)}
                    size={playerIconSize}
                  />
                ) : (
                  <BiPlay
                    onClick={() => playerState.playing.set(!isPlaying)}
                    size={playerIconSize}
                  />
                )}
                <BiSkipNext
                  onClick={() => {
                    playerState.songIndex.set(
                      (prev) => Math.abs(prev + 1) % songList.length
                    );
                    playerState.progress.set(0);
                  }}
                  size={playerIconSize}
                />
              </HStack>

              <HStack spacing={1} flexGrow={1} alignItems='center'>
                <Box className='me-1'>{timeformat()}</Box>
                <Slider
                  maxW='100%'
                  aria-label='Volume'
                  defaultValue={0}
                  step={1}
                  min={0}
                  max={playerState.songLength.get()}
                  value={playerState.progress.get()}
                  onChange={(event) => {
                    playerState.progress.set(event);
                    ref.current.seek(event);
                  }}
                  onMouseEnter={() => setShowPlayerTooltip(true)}
                  onMouseLeave={() => setShowPlayerTooltip(false)}
                >
                  <SliderTrack bg='blackAlpha.400'>
                    <SliderFilledTrack bg='blackAlpha.800' />
                  </SliderTrack>
                  <Tooltip
                    hasArrow
                    bg='black'
                    color='white'
                    placement='top'
                    isOpen={showPlayerTooltip}
                    label={`${timeformat()}`}
                  >
                    <SliderThumb />
                  </Tooltip>
                </Slider>
                <Box className='ms-1'>{remainingTime()}</Box>
              </HStack>
              <Popover placement='top-start'>
                <PopoverTrigger>
                  <Button>
                    <RiPlayListFill size={15} />
                  </Button>
                </PopoverTrigger>
                <Portal>
                  <PopoverContent bg='black' color='white'>
                    <PopoverArrow />
                    <PopoverHeader>Select Song</PopoverHeader>
                    <PopoverCloseButton />
                    <PopoverBody>
                      <Stack spacing={2}>
                        {songList.map((item: any, index) => (
                          <Box
                            key={index}
                            onClick={() => {
                              playerState.songIndex.set(index);
                              playerState.progress.set(0);
                              playerState.playing.set(true);
                            }}
                            cursor='pointer'
                          >
                            <Card bg='black' border='2px'>
                              <Text
                                style={{ fontSize: 14 }}
                                padding='8px'
                                color='white'
                              >
                                {item.filename.substring(0, 25)}
                              </Text>
                            </Card>
                          </Box>
                        ))}
                      </Stack>
                    </PopoverBody>
                  </PopoverContent>
                </Portal>
              </Popover>
              <HStack
                spacing={1}
                width='120px'
                alignItems='center'
                paddingRight='8px'
              >
                <BiVolumeLow size={playerIconSize} />
                <Slider
                  maxW='100px'
                  aria-label='Volume'
                  value={playerState.volume.get()}
                  onChange={(event) => playerState.volume.set(event)}
                  colorScheme='blackAlpha'
                  onMouseEnter={() => setShowVolumeTooltip(true)}
                  onMouseLeave={() => setShowVolumeTooltip(false)}
                >
                  <SliderTrack bg='blackAlpha.400'>
                    <SliderFilledTrack bg='blackAlpha.800' />
                  </SliderTrack>
                  <Tooltip
                    hasArrow
                    bg='black'
                    color='white'
                    placement='top'
                    isOpen={showVolumeTooltip}
                    label={`${playerState.volume.get()}%`}
                  >
                    <SliderThumb />
                  </Tooltip>
                </Slider>
                <BiVolumeFull size={playerIconSize} />
              </HStack>
            </HStack>
          </Card>
        </>
      ) : (
        <Text>No Song Is Available</Text>
      )}
    </>
  );
}
