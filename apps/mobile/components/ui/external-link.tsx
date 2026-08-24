import React, { ComponentProps } from 'react';
import { Href, Link } from 'expo-router';
import { openBrowserAsync, WebBrowserPresentationStyle } from 'expo-web-browser';
import * as Haptics from 'expo-haptics';
import { Platform } from 'react-native';

type Props = Omit<ComponentProps<typeof Link>, 'href'> & {
  href: Href & string;
  enableHaptics?: boolean;
};

export function ExternalLink({ href, enableHaptics = true, ...rest }: Props) {
  return (
    <Link
      target="_blank"
      accessibilityRole="link"
      accessibilityHint="Opens in external browser"
      {...rest}
      href={href}
      onPress={async (event) => {
        if (enableHaptics) {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        }

        if (Platform.OS !== 'web') {
          // Prevent standard linking and open in in-app browser
          event.preventDefault();
          try {
            await openBrowserAsync(href, {
              presentationStyle: WebBrowserPresentationStyle.AUTOMATIC,
              toolbarColor: '#2563eb',
              showTitle: true,
              enableBarCollapsing: true,
            });
          } catch (err) {
            console.error('Failed to open external browser link', err);
          }
        }
      }}
    />
  );
}
